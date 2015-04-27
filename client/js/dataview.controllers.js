'use strict';
angular.module('victimas').
  directive('postRender', [ '$timeout', function($timeout) {
    var def = {
        restrict : 'A', 
        terminal : true,
        transclude : true,
        link : function(scope, element, attrs) {
            var content = scope.get_vis_data();
            scope.create_pie(content);
        }
    };

    return def;

    }]);

