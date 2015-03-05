module.exports = {
  putMapping: putMapping
};

function putMapping(es, opts) {
  if(!es) { return cb('No es!'); }
  if(!opts) { return cb('No opts!'); }
  return function _putMapping(cb) {
    var mapping;
    try {
      opts.body = require('./mappings/' + opts.type + '.json');
    } catch(e) { return cb(); }
    es.indices.putMapping(opts, cb);
  }
}
