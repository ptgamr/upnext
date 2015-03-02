(function() {
    'use strict';

    function loadingDirective() {

        var initParams = function($scope) {
            $scope.ver = $scope.variation || 4;
        };

        return {
            restrict: 'E',
            scope: {
                'variation': '@'
            },
            templateUrl: 'scripts/views/loadingDirective.html',
            link : function($scope) {
                initParams($scope);
            }
        };
    };

    var commonModule = angular.module('soundCloudify');
    commonModule.directive('loading', loadingDirective);
}());
