module.exports = function(Reporte) {
  Reporte.observe('access', function(ctx, next) {
    var aggs = ctx.Model.settings.aggs = {};
    // console.log(ctx.query);
    aggs.tiempo = {
      "ranges": [
        { "to": "now" }
      ]
    };
    next();
  });
};
