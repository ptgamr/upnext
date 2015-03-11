(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackTitle', trackTitleDirective);

    function trackTitleDirective() {
        return {
            restrict: 'E',
            template: '<div class="title-wrapper"><a class="moving-title">{{title}}</a></div>'
            link: function($scope, element, attrs, playerController) {

            }
        };
    }
}());
