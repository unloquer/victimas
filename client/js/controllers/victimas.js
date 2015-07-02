'use strict';
angular.module('victimas')
  .controller('VictimasCtrl', ['$scope', 'dataService', 'leafletData', 'Reporte', '$state', function($scope, dataService, leafletData, Reporte, $state) {
    $scope.top = {};
    $scope.status = {};
    $scope.status.open = true;
    $scope.oneAtATime = false;
    $scope.current_vis  = "mapa";

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


    $scope.$on('chosen:updated', function(e, args) {
      console.log("chosen:updated");
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
        $scope.$broadcast('victimas:data_changed'); 
      });

    });

    dataService.filtros(function(data) {
      $scope.filtros = {
        'tipificaciones': data[0].filtros,
        'responsables': data[1].filtros,
        'departamentos': data[2].filtros
      };
    });


    Reporte.find({}, function(data) {
        $scope.stats = data.pop();
        $scope.aggs = $scope.stats.aggs;
        console.log($scope.aggs);
        $scope.reportes = data;
        resolverTipificaciones($scope.aggs.tipificacion, 5);
        $scope.$broadcast('victimas:data_changed'); 
    });


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
    

  }]);
