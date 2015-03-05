var $a = require('async');
var _ = require('lodash');
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
  host: 'cos:9200',
  // log: 'trace'
});
var putMapping = require('../../utils').putMapping;

var FROM_INDEX = 'nocheyniebla';
var FROM_TYPE = 'reporte';
var TO_INDEX = 'victimas';
var TO_TYPE = 'reporte';

var hitsCount = 0;

$a.series([
  deleteMapping,
  putMapping(es, { index: TO_INDEX, type: TO_TYPE }),
  reindex
], function(err) {
  if(err) console.log(err);
  else console.info('Reindexing Successful!');
  process.exit();
});

function deleteMapping(cb) {
  es.indices.deleteMapping({ index: TO_INDEX, type: TO_TYPE }, cb);
}

function reindex(cb) {
  es.search({
    index: FROM_INDEX,
    type: FROM_TYPE,
    scroll: '120s',
    body: { query: { match_all: {} }, size: 100 }
  }, function scroll(error, res) {
    if (res.hits.total === hitsCount) {
      return cb();
    }

    var hits = res.hits.hits;
    hitsCount += hits.length;
    var bulk = _.flatten(
      hits.map(function(doc) {
        return [
          { index: { _index: TO_INDEX, _type: TO_TYPE } },
          doc._source
        ];
      })
    );

    es.bulk({
      body: bulk
    }, function(err) {
      if(err) {
        process.exit();
        return console.log(err);
      }
      es.scroll({
        scrollId: res._scroll_id,
        scroll: '120s'
      }, scroll);
    });
  });
}
