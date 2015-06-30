'use strict';
angular.module('victimas')
  .controller('VictimasCtrl', ['$scope', 'dataService', 'leafletData', 'Reporte', '$state', function($scope, dataService, leafletData, Reporte, $state) {
    $scope.top = {};
    $scope.status = {};
    $scope.status.open = true;
    $scope.oneAtATime = false;
    $scope.current_vis  = "mapa";
    $scope.vis_title    = null;
    $scope.vis_subtitle = null;

    $scope.color_palette = [
      "#FFED6F",
      "#CCEBC5",
      "#BC80BD",
      "#D9D9D9",
      "#FCCDE5",
      "#80B1D3",
      "#FDB462",
      "#B3DE69",
      "#FB8072",
      "#BEBADA",
      "#FFFFB3",
      "#8DD3C7",
      "#D0533D",
      "#415354",
      "#CD5B89"
    ];
    $scope.selected = {
      tipificacion: [],
      responsable: [],
      ubicacion: []
    };


    if ($state.current.name) {
      if ($state.current.name.indexOf('victimas.') > -1) {
        $scope.current_vis = ($state.current.name.substr('victimas.'.length));
      }
    }

    $scope.$on('$stateChangeSuccess', function () {
      console.log("route changed");
      if ($scope.current_vis == 'mapa') {
        $scope.load_map();
      }
    });

    $scope.$on('chosen:updated', function(e, args) {
      var field = args.field.split('.').pop();
      $scope.selected[field] = args.selected;

      var filter = { filter: {}};
      Object.keys($scope.selected).forEach(function(f) {
        if($scope.selected[f].length) {
          filter.filter['_'+f] = $scope.selected[f].join(',');
        }
      });

      console.log(JSON.stringify(filter, null, 2));
      Reporte.find(filter, function(data) {
        $scope.stats = data.pop();
        $scope.aggs = $scope.stats.aggs;
        resolverTipificaciones($scope.aggs.tipificacion, 5);
        layer.setStyle(style);
      });
    });

    dataService.filtros(function(data) {
      $scope.filtros = {
        'tipificaciones': data[0].filtros,
        'responsables': data[1].filtros,
        'departamentos': data[2].filtros
      };
    });

    $scope.load_map = function() {
        leafletData.getMap().then(function(map) {
          omnivore.topojson('/data/municipios.topojson', null, layer)
          .addTo(map);
        });
    };

    $scope.load_data = function(callback) {
      Reporte.find({}, function(data) {
        $scope.stats = data.pop();
        $scope.aggs = $scope.stats.aggs;
        console.log($scope.aggs);
        $scope.reportes = data;
        resolverTipificaciones($scope.aggs.tipificacion, 5);

        $scope.load_map();

        if (callback) {
          callback();
        }
      });
    };

    $scope.load_data(null);

    function resolverTipificaciones(t, n) {
      var top_n = _.take(t, n);
      $scope.top.tipificaciones = top_n.map(function(e) {
        return {
          key: (function() {
            return _.pluck(_.where($scope.filtros.tipificaciones, { codigo: e.key }), 'nombre').shift();
          })(),
          count: e.doc_count
        };
      });
    };

    $scope.layers = {
      baselayers: {
        mapbox_terrain: {
          name: 'Mapbox Terrain',
          url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
          type: 'xyz',
          layerOptions: {
            apikey: 'pk.eyJ1Ijoic29mcml0byIsImEiOiIySzg3REhRIn0.2QFIYC9bmtbGPqk90CDdkQ',
            mapid: 'examples.map-20v6611k'
          }
        }
      }
    };

    angular.extend($scope, {
      center: {
        lat: 4.5980478,
        lng: -74.0760867,
        zoom: 7
      }
    });

    var layer = L.geoJson(null, {
      style: style,
      onEachFeature: onEachFeature
    });

    function highlightFeature(e) {
      var layer = e.target;
      layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });
      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }
    }

    function getColorByCasos(id) {
      var n = _.pluck(_.where($scope.aggs.DIVIPOLA, { key: parseInt(id).toString() }), 'doc_count').shift();
      return getColor(n);
    }

    function getColor(d) {
      return (
        d > 600 ? '#800026' :
        d > 400 ? '#BD0026' :
        d > 200 ? '#E31A1C' :
        d > 80 ? '#FC4E2A' :
        d > 50 ? '#FD8D3C' :
        d > 20 ? '#FEB24C' :
        d > 0 ? '#FED976' : 'white' //'#FFEDA0'
      );
    }

    function resetHighlight(e) {
      layer.resetStyle(e.target);
      //        info.update();
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    function style(feature) {
      // console.log(feature.properties);
      return {
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6,
        fillColor: getColorByCasos(feature.properties.DIVIPOLA)
      };
    }
      $scope.set_visualization = function(visualization) {
        $scope.current_vis = visualization;
        var first_view = $scope.getFirstViewForVisualization(visualization);
        $state.transitionTo('visual.' + visualization + first_view);
        return false;
      }

    $scope.getFirstViewForVisualization = function(vis) {
      if (vis == "stats") {
        return ".pie";
      } else if (vis == "mapa") {
        return ".cloropleth";
      } else if (vis == "records") {
        return "";
      } else {
        return "";
      }
    }
    
    $scope.get_vis_data = function(view) {
     //$scope.stats = $scope.$parent.stats;
      if (! $scope.stats) {
        $scope.load_data(function() { 
          var content = eval_vis_data(view);
          $scope.create_pie(content, view);
        });
      } else {
          return eval_vis_data(view);
      }
    };

    function eval_vis_data(view) {
      var data_objects = [];

      if (view == "ubicacion") {
        data_objects = $scope.stats.aggs.ubicacion;
        $scope.vis_title    = "Casos por ubicación";
        $scope.vis_subtitle = "Total de casos por departamento";
      } else if (view == "tipificaciones") {
        data_objects = $scope.top.tipificaciones;
        $scope.vis_title    = "Casos por tipo";
        $scope.vis_subtitle = "Todos los casos según su tipo";
      } else if (view == "responsables") {
        data_objects = $scope.stats.aggs.responsable;
        $scope.vis_title    = "Casos por responsables";
        $scope.vis_subtitle = "Todos los casos por sus responsables";
      } 

      var content_obj = [];

      for (var i=0; i < data_objects.length; i++) {
        var obj = {};
        obj.label = data_objects[i].key;
        obj.value = data_objects[i].doc_count;
        if (data_objects[i].hasOwnProperty('count')) {
          obj.value = data_objects[i].count;
        }
        obj.color = $scope.color_palette[15%i];
        content_obj.push(obj);
      }

      return content_obj; 
    }

    $scope.create_pie = function(content, view) {
        var div_id = "pie_" + view; 
        var pie = new d3pie(div_id, {
        "header": {
          "title": {
            "text": $scope.vis_title ,
            "color": "#19b393",
            "fontSize": 32,
            "font": "open sans"
          },
          "subtitle": {
            "text": $scope.vis_subtitle,
            "color": "#676a6c",
            "fontSize": 20,
            "font": "open sans"
          },
          "titleSubtitlePadding": 10
        },
        "footer": {
          "color": "#999999",
          "fontSize": 10,
          "font": "open sans",
          "location": "bottom-left"
        },
        "size": {
       //   "canvasHeight": 640,
       //   "canvasWidth": 320,
       //   "canvasHeight": 640,
       //   "canvasWidth": 1000,
          "pieInnerRadius": "1%",
          "pieOuterRadius": "100%"
        },
        "data": {
          "sortOrder": "value-desc",
          "smallSegmentGrouping": {
            "enabled": true
          },
            "content": content
  /*        "content": [
            {
              "label": "FoxPro",
              "value": 32170,
              "color": "#248838"
            },
            {
              "label": "vavav",
              "value": 23322,
              "color": "#efefef"
            }
          ]*/
        },
        "labels": {
          "outer": {
            "pieDistance": 32
          },
          "inner": {
            "hideWhenLessThanPercentage": 3
          },
          "mainLabel": {
            "font": "open sans",
            "fontSize": 16
          },
          "percentage": {
            "color": "#ffffff",
            "decimalPlaces": 1
          },
          "value": {
            "color": "#adadad",
            "fontSize": 11
          },
          "lines": {
            "enabled": true,
            "style": "straight"
          }
        },
        "tooltips": {
          "enabled": true,
          "type": "placeholder",
          "string": "{label}: {value}, {percentage}%"
        },
        "effects": {
          "load": {
            "speed": 2200
          },
          "pullOutSegmentOnClick": {
            "speed": 400
          }
        },
        "misc": {
          "gradient": {
            "enabled": true,
            "percentage": 100
          },
          "canvasPadding": {
            "bottom": 30
          },
          "pieCenterOffset": {
            "y": 40
          }
        },
        "callbacks": {}
      });
    }
  }]);
