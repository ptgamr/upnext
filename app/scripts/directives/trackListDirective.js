(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackList', trackListDirective);

    function trackListDirective() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/trackList.html',
            scope: {
                tracks: '=',
                onTrackClick: '@'
            },
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {
                $scope.player = playerController;

                //onTrackClick can be 'playpause || queue || playnow';
                $scope.onTrackClick = $scope.onTrackClick || 'play';

                $scope.isTrackPlaying = function(track) {
                    if (!playerController.state.playing) {
                        return false;
                    }
                    return playerController.state.currentTrack.id === track.id;
                }

                $scope.isTrackPaused = function(track) {
                    
                    if (playerController.state.playing) {
                        return false;
                    }
                    return playerController.state.currentTrack.id === track.id;
                }

                $scope.handleTrackClick = function($index) {

                    if ($scope.onTrackClick === 'playpause') {

                        playerController.playPause($index);

                    } else if ($scope.onTrackClick = 'playnow') {

                        var track = $scope.tracks[$index];
                        playerController.add(track, true);

                    } else {

                    }

                };
            }
        };
    }
}());
