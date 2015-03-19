var $a = require('async');
var _ = require('lodash');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
  host: 'cos:9200',
  // log: 'trace'
});
var putMapping = require('../utils').putMapping;

var FROM_INDEX = 'victimas3';
var FROM_TYPE = 'reporte';
var TO_INDEX = 'victimas2';
var TO_TYPE = 'reporte';

var hitsCount = 0;

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
  var filter = {
    "and": [
      {
        "terms": {
          "_ubicacion": [depto.toLowerCase()] // normalize(depto)
        }
      },
      { "terms":
        {
          "_ubicacion": [municipio.toLowerCase()] // normalize(municipio)
        }
      }
    ]
  };

  if(depto === municipio) {
    filter.and.push({
      "term": { "ubicacion": [depto.toUpperCase(), municipio.toUpperCase()].join(' / ') }
    });
  }

  return {
    "size": 2000,
    "query": {
      "filtered": {
        "query": {"match_all": {}},
        "filter": filter
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
  else console.log('Reindexing Successful!');
  process.exit();
});

function updateLocation(cb) {
  $a.eachSeries(municipios, function(m, _cb) {
    es.search({
      index: FROM_INDEX,
      type: FROM_TYPE,
      body: query(m.DEPTO, m.NOMBRE)
    }, function(err, results) {
	    console.log([m.DEPTO.toLowerCase(), m.NOMBRE.toLowerCase(), results.hits.total, m.DIVIPOLA]);
      var bulk = _.flatten(results.hits.hits.map(function(doc) {
        doc._source.location = [ m.y, m.x ];
        doc._source.DIVIPOLA = m.DIVIPOLA;
        return [
          { index: { _id: doc._id, _index: TO_INDEX, _type: TO_TYPE } },
          doc._source
        ];
      }));

      if(!bulk.length) {
        return _cb();
      }

      es.bulk({
        body: bulk
      }, function(err) {
        if(err) {
          console.log(err);
          return _cb(err);
        }
        _cb();
      });
    });
  }, cb);
}

function deleteMapping(cb) {
  es.indices.deleteMapping({ index: TO_INDEX, type: TO_TYPE, ignore: 404 }, cb);
}