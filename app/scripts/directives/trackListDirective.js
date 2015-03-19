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
                onTrackClick: '@',
                originToggle: '='
            },
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {
                $scope.player = playerController;

                //onTrackClick can be 'playpause || queue || playnow';
                $scope.onTrackClick = $scope.onTrackClick || 'play';

                $scope.currentFilter = {origin: ''};

                $scope.$watch('originToggle',function(toggle) {
                    
                    var filter = '';

                    if (toggle.soundcloud && toggle.youtube) {
                        filter = '';
                    } else if (toggle.soundcloud) {
                        filter += 'sc';
                    } else if (toggle.youtube) {
                        filter += 'yt';
                    }

                    $scope.currentFilter.origin = filter;

                }, true);

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

                $scope.handleTrackClick = function(track) {

                    if ($scope.onTrackClick === 'playpause') {

                        var index = _.findIndex($scope.tracks, function(iterator) {
                            return iterator.id === track.id;
                        });

                        playerController.playPause(index);

                    } else if ($scope.onTrackClick = 'playnow') {
                        playerController.add(track, true);
                    } else {

                    }

                };
            }
        };
    }
}());
