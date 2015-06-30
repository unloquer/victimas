'use strict';
angular.module('victimas').
  directive('postRender', [ '$timeout', function($timeout) {
    var def = {
        restrict : 'A', 
        terminal : true,
        transclude : true,
        link : function(scope, element, attrs) {
            scope.view = attrs["view"];
            console.log(scope.view);
            var content = scope.get_vis_data(scope.view);
            scope.create_pie(content, scope.view);
        }
    };

    return def;

    }]);

