'use strict';
angular.module('victimas')
  .controller('VictimasCtrl', ['$scope', 'dataService', 'leafletData', function ($scope, dataService, leafletData) {
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
        zoom: 6
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

    function getColor(d) {
      return (
        d > 30000 ? '#800026' :
        d > 15000 ? '#BD0026' :
        d > 7500 ? '#E31A1C' :
        d > 3750 ? '#FC4E2A' :
        d > 1800 ? '#FD8D3C' :
        d > 900 ? '#FEB24C' :
        d > 400 ? '#FED976' : 'white' //'#FFEDA0'
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
      return {
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6,
        fillColor: getColor(feature.properties.AREA)
      };
    }

    leafletData.getMap().then(function(map) {
      omnivore.topojson('/data/municipios.topojson', null, layer)
        .addTo(map);
    });

  }]);
