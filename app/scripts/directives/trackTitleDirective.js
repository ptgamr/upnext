(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackTitle', trackTitleDirective);

    function trackTitleDirective() {
        return {
            restrict: 'E',
            link: function($scope, element, attrs, playerController) {

            }
        };
    }
}());
