/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2015 Webapplayers.com
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
  $urlRouterProvider.otherwise("/entrada");

  $ocLazyLoadProvider.config({
    // Set to true if you want to see what and when is dynamically loaded
    debug: false
  });

  $stateProvider
    .state('entrada', {
      url: "/entrada",
      templateUrl: "views/entrada.html",
      data: { pageTitle: 'Victimas del Conflicto Armado en Colombia - Entrada' }
    })
    .state('victimas', {
      abstract: true,
      url: "/victimas",
      cache: false,
      templateUrl: "views/home.html"
    })
    .state('victimas.mapa', {
        url: "/mapa",
        cache: false,
        templateUrl: "views/mapa.html",
        resolve: {
          uiData: function($rootScope, dataService) {
            dataService.filtros(function(data) {
              $rootScope.filtros = {
                'tipificaciones': data[0].filtros,
                'responsables': data[1].filtros,
                'departamentos': data[2].filtros
              };
            });
          },
          loadPlugin: function ($ocLazyLoad) {
            return $ocLazyLoad.load([
              {
                files: [
                  'js/bower_components/leaflet/dist/leaflet.css'
                ]
              },
              {
                insertBefore: '#loadBefore',
                name: 'victimas.directives',
                files: [
                  'css/plugins/chosen/chosen.css',
                  'js/plugins/chosen/chosen.jquery.js',
                  'js/plugins/chosen/chosen.js'
                ]
              }
            ]);
          }
        }
    })
    .state('victimas.ubicacion', {
        url: "/ubicacion",
        cache: false,
        templateUrl: "views/ubicacion.html"
    })
    .state('victimas.tipificaciones', {
        url: "/tipificaciones",
        cache: false,
        templateUrl: "views/ubicacion.html"
    })
    .state('victimas.responsables', {
        url: "/responsables",
        cache: false,
        templateUrl: "views/ubicacion.html"
      });
  }
  angular
    .module('victimas')
    .config(config)
    .run(function($rootScope, $state, dataService) {
      $rootScope.$state = $state;
    });
