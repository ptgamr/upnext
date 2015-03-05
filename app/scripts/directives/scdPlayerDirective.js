(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('scdPlayer', soundCloudifyPlayerDirective);

    function soundCloudifyPlayerDirective() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/player.html',
            scope: true,
            link: function($scope) {

            }
        };
    }
}());
