(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackListReact', trackListReactDirective)
        .directive('trackList', trackListDirective);

    function trackListReactDirective(reactDirective) {
        return reactDirective('TrackList')
    };

    function trackListDirective($playlistMenu, CorePlayer, PlaylistService, StarService, $mdToast, GATracker) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/trackList.html',
            scope: {
                tracks: '=',
                trackClick: '&',
                onTrackClick: '@',
                listContext: '@',
                listIndex: '@'
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

                    GATracker.trackDiscovery('add to playlist', $scope.listContext);
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

                        GATracker.trackDiscovery('play - pause', $scope.listContext);

                    } else if ($scope.onTrackClick = 'playnow') {

                        if (!track) {
                            throw new Error('trying to add track, but no track to add');
                        }

                        CorePlayer.add(track, true);

                        GATracker.trackDiscovery('add track', $scope.listContext);
                    } else {

                    }
                };

                $scope.playNext = function(track) {

                    CorePlayer.playNext(track);

                    GATracker.trackDiscovery('up next', $scope.listContext);

                    $mdToast.show(
                      $mdToast.simple()
                        .content('Track has been queued up next')
                        .position('bottom right')
                        .parent(angular.element(document.querySelector('#tab-content')))
                        .hideDelay(1000)
                    );
                };

                $scope.handleRemoveTrack = function(track) {
                    var index = _.findIndex($scope.tracks, function(iterator) {
                        return iterator.id === track.id;
                    });

                    // //since $scope.tracks is always a decorated array, means we have no reference to it
                    // //we have to remove track in this to update the UI
                    // $scope.tracks.splice(index, 1);

                    if ($scope.listContext === 'nowplaying') {
                        CorePlayer.remove(index);
                    } else if ($scope.listContext === 'playlist') {
                        if(!$scope.listIndex) {
                            throw new Error('list index undefined');
                        }
                        $scope.tracks.splice(index, 1);
                        PlaylistService.removeTrackFromPlaylist(index, $scope.listIndex);
                    }

                    GATracker.trackDiscovery('remove track', $scope.listContext);
                };

                $scope.starTrack = function(track) {
                    track.starred = !!!track.starred;

                    if (track.starred) {
                        GATracker.trackDiscovery('star track', $scope.listContext);
                    } else {
                        GATracker.trackDiscovery('unstar track', $scope.listContext);
                    }

                    if (track.starred) {
                        StarService.starTrack(track);
                    } else {
                        StarService.unstarTrack(track);
                    }
                };
            }
        };
    }
}());
