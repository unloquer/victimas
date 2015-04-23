process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = function scrapeNocheyniebla(__cb) {
  var $a = require('async');
  var _ = require('lodash');
  var elasticsearch = require('elasticsearch');
  var crypto = require('crypto');
  var agent = require('superagent-charset');
  var cheerio = require('cheerio');
  var es = new elasticsearch.Client({
    host: 'cos:9200',
    // log: 'trace'
  });
  var utils = require('../utils');

  var departamentos,
    clasificaciones,
    body,
    currentDepto,
    cookie,
    csrf,
    START_AT = ['', ''];

  var INDEX = 'victimas';
  var TYPE = 'reporte';
  var opts = { index: INDEX, type: TYPE };
  // Start at given [Depto,Tipificacion]
  // START_AT = ['91', 'A:1:10'];

  function store(records, cb) {
    var bulk = {
      'body': []
    };

    console.log(records.length);
    // Store reports in ES
    records.forEach(function(reporte) {
      var shasum = crypto.createHash('sha1');
      shasum.update(reporte.victimas);
      var _id = shasum.digest('hex');

      bulk.body = bulk.body.concat([
        { index: { _index: INDEX, _type: TYPE, _id: _id } },
        reporte
      ]);
    });

    if(bulk.body.length) {
      es.bulk(bulk, cb);
    } else {
      cb();
    }
  };

  function getByDepartamentoAndClasificaciones(clasificacion) {
    var data = {};
    data['evita_csrf'] = csrf;
    data['_qf_default:consultaWeb'] = 'id_departamento';
    data['id_departamento'] = currentDepto;
    data['clasificacion[]'] = clasificacion;
    data['critetiqueta'] = '0';
    data['orden'] = 'fecha';
    data['mostrar'] = 'tabla';
    data['caso_memo'] = '1';
    data['caso_fecha'] = '1';
    data['m_ubicacion'] = '1';
    data['m_victimas'] = '1';
    data['m_presponsables'] = '1';
    data['m_tipificacion'] = '1';
    data['_qf_consultaWeb_consulta'] = 'Consulta';

    console.log('Consultando ...');
    console.log('Departameto: '+currentDepto+' - Tipificacion: '+clasificacion);
    agent
      .post('https://www.nocheyniebla.org/consulta_web.php')
      .send(data)
      .charset('ISO-8859-1')
      .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Cookie', cookie)
      .end(function(error, res){
        var $ = cheerio.load(res.text);
        var records = $('table tr').map(function MapHTMLTable() {
          var record = {};
          var $row = $(this);

          $row.find('td').each(function(i) {
            var field = ['descripcion', 'fecha', 'ubicacion', 'victimas', 'responsable', 'tipificacion'][i];
            record[field] = $(this).text();

            var normalizer = {
              responsable: function() {
                return record[field].split(',').map(function(t) { return t.trim() });
              },
              ubicacion: function() {
                var _m = record[field].split('/').map(function(t) {
                  return t.toLowerCase().trim();
                });
                // console.log(_m);
                _m.splice(2);
                _m.reverse();
                return _m.join(',');
              },
              tipificacion: function() {
                return record[field].match(/([A-D]:\d+:\d+)/g);
              }
            };
            if(normalizer[field]) {
              record['_'+field] = normalizer[field]();
            }
          });
          return record;
        }).toArray();
        // The first row is the table's header
        records.shift();
        store(records, next);
      });
  }

  function next(err) {
    if(err) {
      console.log(err);
    }

    var clasificacion = clasificaciones.shift();

    if(!clasificacion) {
      clasificaciones.push(0);
      currentDepto = departamentos.shift();
      next();
      return;
    }

    currentDepto = currentDepto || departamentos.shift();
    if(!currentDepto) {
      console.log('The End');
      return process.exit();
    }

    getByDepartamentoAndClasificaciones(clasificacion);
    clasificaciones.push(clasificacion);
  }

  $a.series([
    //es.indices.deleteMapping.bind(es, opts),
    utils.putMapping(es, opts)
  ], function(err) {
    err && (console.log(err) && process.exit());
    agent.get('https://www.nocheyniebla.org/consulta_web.php', function(err, res) {
      var $ = cheerio.load(res.text);
      body = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+$('form').toString()+'</body></html>';

      csrf = $('form').find('[name=evita_csrf]').attr('value');
      cookie = (res.headers['set-cookie']);

      clasificaciones = $('form').find('[name=clasificacion\\[\\]] option').map(function() {
        return $(this).attr('value').trim();
      }).toArray();

      departamentos = $('form').find('[name=id_departamento] option').map(function() {
        return $(this).attr('value').trim();
      }).toArray();
      departamentos = _.compact(departamentos);

      var deptoIndex = START_AT[0] ? departamentos.indexOf(START_AT[0]) : departamentos[0];
      var tipifIndex = START_AT[1] ? clasificaciones.indexOf(START_AT[1]) : clasificaciones[0];

      departamentos.splice(0, deptoIndex);
      clasificaciones.unshift(0);
      clasificaciones = clasificaciones.concat(clasificaciones.splice(0, tipifIndex));

      // Mark the head of clasificaciones. Look next()
      next();
    });
  });

};

module.exports();