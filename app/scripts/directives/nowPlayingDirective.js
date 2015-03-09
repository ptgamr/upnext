(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('nowPlaying', nowPlayingDirective);

    function nowPlayingDirective(Category) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/nowPlaying.html',
            scope: true,
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {
                $scope.player = playerController;

                $scope.play = function(index) {
                    playerController.play(index);
                }
            }
        };
    }
}());
