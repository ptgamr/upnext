(function() {
    'use strict';

    angular.module('soundCloudify')
            .directive('playingTrackAware', playinTrackAwareDirective);

    function playinTrackAwareDirective($timeout, CorePlayer) {

        return {
            restrict: 'A',
            scope: {},
            transclude: true,
            template: '<div ng-transclude></div>',
            link : function($scope, $element, attrs) {
                $scope.player = CorePlayer;

                $scope.$on('componentDidUpdate', function() {
                    updateActiveTrack(CorePlayer.state.currentTrack);
                });

                $scope.$watch('player.state.currentTrack', function(currentTrack) {
                    updateActiveTrack(currentTrack);
                }, true);

                $scope.$watch('player.state.playing', function(status) {
                    updateActiveTrack(CorePlayer.state.currentTrack);
                }, true);

                function updateActiveTrack(track) {
                    angular.element($element[0].querySelector('.playing, .pause')).removeClass('playing pause');

                    var cssClass = 'playing';
                    
                    if (!CorePlayer.state.playing) {
                        cssClass = 'pause';
                    }
                    
                    angular.element($element[0].querySelector('#track-item-' + track.id)).addClass(cssClass);
                }
            }
        };
    };
}());
