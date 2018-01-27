module.exports = {
  search
};

function search(filter, cb) {
  const _ = require('lodash');
  const elasticsearch = require('elasticsearch');
  const es = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace'
  });

  var queryOpts = {
    "filters": {
      "ubicacion": {
        "terms": {
          "ubicacion.keyword": ""
        }
      },
      "responsable": {
        "terms": {
          "responsable.keyword": ""
        }
      },
      "tipificacion": {
        "terms": {
          "tipificacion.keyword": ""
        }
      }
    },
    "aggs": {
      "ubicacion": {
        "terms": {
            "field": "ubicacion.keyword",
            "size": 50,
            "shard_size": 250
        }
      },
      "DIVIPOLA": {
        "terms": {
            "field": "DIVIPOLA.keyword",
            "size": 1500,
            "shard_size": 1500
        }
      },
      "responsable": {
        "terms": {
            "field": "responsable.keyword",
            "size": 50,
            "shard_size": 250
        }
      },
      "tipificacion": {
        "terms": {
          "field": "tipificacion.keyword",
          "size": 50,
          "shard_size": 250
        }
      }
    }
  };

  function makeQuery(criteria, size, page) {

    var opts = {
      index: 'casos_raw',
      type: 'caso',
      pretty: true
    };
    opts['size'] = size || 20;
    opts['from'] = page ? page * size : 0;

    if(criteria) {
      var filters = Object.keys(queryOpts.filters);
      var userFilters = Object.keys(criteria);
      var applyFilters = _.intersection(filters, userFilters);

      console.log(filters);
      console.log(userFilters);
      console.log(applyFilters);

      if(!applyFilters.length) {
        opts.body = {
          'query': { 'match_all': {} },
          'aggs': queryOpts.aggs
        };
        return opts;
      }

      var filter = { bool: { must: [] }};
      filter.bool.must = applyFilters.map(function(field) {
        var f = queryOpts.filters[field];
        f.terms[`${field}.keyword`] = criteria[field].split(',');
        return f;
      });

      opts.body = {
        'query': filter,
        //   'bool': {
        //     'must': { 'match_all': {} },
        //     'filter': filter
        //   }
        // },
        // 'aggs': queryOpts.aggs
      };
    }

    return opts;
  }

  function all(filter, done) {
    console.log(JSON.stringify(makeQuery(filter), true, 2))
    es.search(makeQuery(filter), function(err, res) {
      if (err) {
        console.trace(err.message);
        return done(err, null);
      }

      // console.log(res);

      // var aggs = {};
      // Object.keys(res.aggregations).forEach(function(k) {
      //   aggs[k] = res.aggregations[k].buckets;
      // });

      var result = {
        total: res.hits.total,
        results: res.hits.hits,
        aggs: res.aggregations
      };
      result = result.results;
      result.push({ total: res.hits.total/*, aggs: aggs*/ });

      done(null, result);
    });
  };

  all({ubicacion:"cauca,antioquis"}, (err, res) => {
    // console.log(res.pop().aggs.ubicacion);
    // console.log(res.map(i => i._source.ubicacion));
    console.log(res);
    cb(null, res);
  });
}
