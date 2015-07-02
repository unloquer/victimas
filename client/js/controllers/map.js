'use strict';
angular.module('victimas')
  .controller('MapCtrl', ['$scope', 'dataService', 'leafletData', 'Reporte', '$state', function($scope, dataService, leafletData, Reporte, $state) {

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


   $scope.$on('$stateChangeSuccess', function () {
      if ($scope.current_vis == 'mapa') {
        $scope.draw_map();
      }
    });

    $scope.$on('victimas:data_changed', function(e, args) {
      console.log("victimas:data_changed - MAP");
      if ($scope.current_vis == 'mapa') {
        $scope.draw_map();
      }
    });

    $scope.draw_map = function() {
      console.log("draw?map");
        leafletData.getMap().then(function(map) {
          omnivore.topojson('/data/municipios.topojson', null, layer)
          .addTo(map);
        });
    }

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
    

  }]);
