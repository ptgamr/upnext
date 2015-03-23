(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackListReact', trackListReactDirective)
        .directive('trackList', trackListDirective);

    function trackListReactDirective(reactDirective) {
        return reactDirective('TrackList')
    };

    function trackListDirective($playlistMenu) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/trackList.html',
            scope: {
                tracks: '=',
                onTrackClick: '@',
                originToggle: '=',
                showRemoveButton: '@'
            },
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {

                /*
                 * onTrackClick can be 'playpause || queue || playnow';
                 */
                $scope.onTrackClick = $scope.onTrackClick || 'playnow';


                /**
                 * Broadcast information to playingTrackAwarenessDirective
                 */
                $scope.componentDidUpdate = function() {
                    $scope.$broadcast('componentDidUpdate');
                };

                /**
                 * Show playlist menu using $playlistMenu service
                 */
                $scope.showPlaylistMenu = function(track) {
                    var targetElement = angular.element(element[0].querySelector('#track-item-' + track.id + ' .add-to-playlist-btn'));
                    $playlistMenu.show({
                        element: targetElement,
                        trackToAdd: track
                    });
                };

                /**
                 * Handler for track click
                 */
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

                $scope.trackFilter = {
                    origin: ''
                };

                $scope.$watch('originToggle',function(toggle) {
                    
                    var filter = '';

                    if (!toggle) return;

                    if (toggle.soundcloud && toggle.youtube) {
                        filter = '';
                    } else if (toggle.soundcloud) {
                        filter += 'sc';
                    } else if (toggle.youtube) {
                        filter += 'yt';
                    }

                    $scope.trackFilter.origin = filter;
                    
                }, true);
            }
        };
    }
}());
