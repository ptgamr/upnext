(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('rightClick', rightClicktDirective);

    function rightClicktDirective($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.rightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    }
}());