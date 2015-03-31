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

                var trackingType = attrs.playingTrackAware;

                $scope.$on('componentDidUpdate', function() {
                    updateActiveTrack();
                });

                $scope.$watch('player.state.currentTrack', function() {
                    updateActiveTrack();
                }, true);

                $scope.$watch('player.state.currentIndex', function() {
                    updateActiveTrack();
                }, true);


                $scope.$watch('player.state.playing', function(status) {
                    updateActiveTrack();
                }, true);

                function updateActiveTrack() {

                    var track = CorePlayer.state.currentTrack;
                    var index = CorePlayer.state.currentIndex;

                    if (!track) return;

                    angular.element($element[0].querySelector('.playing, .pause')).removeClass('playing pause');

                    var cssClass = 'playing';
                    
                    if (!CorePlayer.state.playing) {
                        cssClass = 'pause';
                    }

                    if (trackingType === 'index') {
                        angular.element($element[0].querySelectorAll('.track-item')[index]).addClass(cssClass);
                    } else {
                        angular.element($element[0].querySelector('#track-item-' + track.id)).addClass(cssClass);
                    }
                }
            }
        };
    };
}());
