'use strict';
angular.module('victimas')
  .controller('VictimasCtrl', ['$scope', 'dataService', function ($scope, dataService) {
    $scope.status = {};
    $scope.status.open = true;
    $scope.oneAtATime = false;
    $scope.filtros = {};

    $scope.$watch('filtros', function(current, former) {
      setTimeout(function() {
        $('select#filtros-tipificaciones').chosen();
        $('select#filtros-responsables').chosen();
        // $('select#filtros-departamentos').chosen();
      }, 100);
    });

    dataService.filtros(function(data) {
      $scope.filtros = {
        'tipificaciones': data[0].filtros,
        'responsables': data[1].filtros,
        'departamentos': data[2].filtros
      };
    });
  }]);
