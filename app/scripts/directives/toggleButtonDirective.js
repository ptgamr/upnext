(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('toggleButton', toggleButton);

    function toggleButton() {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {

                var toggleClass = 'md-primary';

                attr.$observe('toggleButton', function(val) {
                    console.log(val);
                    if (val === 'true') {
                        element.addClass(toggleClass)
                    } else {
                        element.removeClass(toggleClass)
                    }
                });

                element.on('click', function() {
                    element.toggleClass(toggleClass);
                });
            }
        };
    }
}());
