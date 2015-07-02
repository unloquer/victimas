'use strict';
angular.module('victimas')
  .controller('StatsCtrl', ['$scope', 'dataService', 'leafletData', 'Reporte', '$state', function($scope, dataService, leafletData, Reporte, $state) {

  $scope.charts = [];

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


  $scope.$on('victimas:data_changed', function(e, args) {
      console.log("current vis: " + $scope.current_vis);
      if ($scope.current_vis == "stats") {
        console.log("Updating stats views");
        /*for (var y=0; y<$scope.charts.length; y++) {
          d3.select('#pie_' + $scope.charts[y]).remove();
        }
        */
        var views = ['ubicacion','tipificaciones','responsables'];
        for (var i=0; i<views.length; i++) {
          var view = views[i];
          console.log("Updating " + view);
          var content = eval_vis_data(view);
          updateView($scope.charts[i], content); 
        }
      }
  });

  function updateView(pie, content) {
    pie.updateProp("data.content", content);
    pie.redraw();
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
          "canvasHeight": 800,
          "canvasWidth": 1000,
          "pieInnerRadius": "8%",
          "pieOuterRadius": "90%"
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
            "bottom": 80
          },
          "pieCenterOffset": {
            "y": 40
          }
        },
        "callbacks": {}
      });

      $scope.charts.push(pie);
    }
  }]);
