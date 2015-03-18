var $a = require('async');
var _ = require('lodash');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
  host: 'cos:9200',
  // log: 'trace'
});
var putMapping = require('../utils').putMapping;

var FROM_INDEX = 'victimas';
var FROM_TYPE = 'reporte';
var TO_INDEX = 'victimas2';
var TO_TYPE = 'reporte';

var hitsCount = 0;

/*
 * Cambios manuales en `centroides_municipios_colombia.json`:
 *
 * Guainia - Guaninía
 * Atlantico - Atlántico
 * La Union - La Unión
 * Tuluá - Tulua
 * Jamundí - Jamundi
 * El Aguila - El Águila
 * Lebrija - Lebríja
 */
var municipios = require('./data/centroides_municipios_colombia');

function normalize(str) {
  var stop = ['san', 'santa', 'de', 'la', 'el', 'lo', 'los', 'las', 'y', 'puerto'];
  var arr = str.split(' ').map(function(s) {
    return s.toLowerCase().trim();
  });
  var params = stop;
  params.unshift(arr);
  return _.without.apply(_, params);
}

var query = function(depto, municipio) {
  return {
    "size": 1000,
    "query": {
      "filtered": {
        "query": {"match_all": {}},
        "filter": {
          "and": [
            {
              "terms": {
                "_ubicacion": depto.toLowerCase() // normalize(depto)
              }
            },
            { "terms":
              {
                "_ubicacion": municipio.toLowerCase() // normalize(municipio)
              }
            }
          ]
        }
      }
    }
  }
};

// Run
$a.series([
  deleteMapping,
  putMapping(es, { index: TO_INDEX, type: TO_TYPE }, 'reporte'),
  updateLocation
], function(err) {
  if(err) console.log(err);
  else console.info('Reindexing Successful!');
  process.exit();
});

function updateLocation(cb) {
  $a.eachSeries(municipios, function(m, cb) {
    console.log(normalize(m.DEPTO), normalize(m.NOMBRE));
    es.search({
      index: FROM_INDEX,
      type: FROM_TYPE,
      body: query(m.DEPTO, m.NOMBRE)
    }, function(err, results) {
      console.log(results.hits.hits.total);
      var bulk = _.flatten(results.hits.hits.map(function(doc) {
        doc._source.location = [ m.y, m.x ];
        doc._source.DIVIPOLA = m.DIVIPOLA;
        return [
          { index: { _id: doc._id, _index: TO_INDEX, _type: TO_TYPE } },
          doc._source
        ];
      }));

      if(!bulk.length) {
        return cb();
      }

      es.bulk({
        body: bulk
      }, function(err) {
        if(err) {
          console.log(err);
          return process.exit();
        }
        cb();
      });
    });
  });
}

function deleteMapping(cb) {
  es.indices.deleteMapping({ index: TO_INDEX, type: TO_TYPE, ignore: 404 }, cb);
}