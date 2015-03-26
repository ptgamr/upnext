(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackListReact', trackListReactDirective)
        .directive('trackList', trackListDirective);

    function trackListReactDirective(reactDirective) {
        return reactDirective('TrackList')
    };

    function trackListDirective($playlistMenu, CorePlayer, PlaylistService) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/trackList.html',
            scope: {
                tracks: '=',
                onTrackClick: '@',
                originToggle: '=',
                showRemoveButton: '@'
            },
            link: function($scope, element, attrs) {

                /*
                 * onTrackClick can be 'playpause || queue || playnow';
                 */
                $scope.onTrackClick = $scope.onTrackClick || 'playnow';


                /**
                 * Broadcast information to playingTrackAwarenessDirective
                 */
                $scope.componentDidUpdate = function() {
                    $scope.$emit('componentDidUpdate');
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
                $scope.handleTrackClick = function(track, index) {

                    if ($scope.onTrackClick === 'playpause') {

                        if (isNaN(index)) {
                            throw  new Error('track index is not specify or not a number for "playpause"');
                        }

                        CorePlayer.playPause(index);

                    } else if ($scope.onTrackClick = 'playnow') {
                        CorePlayer.add(track, true);
                    } else {

                    }

                };

                $scope.handleRemoveTrack = function(track) {
                    var index = _.findIndex(CorePlayer.tracks, function(iterator) {
                        return iterator.id === track.id;
                    });

                    CorePlayer.remove(index);
                };

                $scope.starTrack = function(track) {
                    track.starred = true;
                    PlaylistService.starTrack(track);
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
