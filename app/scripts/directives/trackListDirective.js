(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('trackListReact', trackListReactDirective)
        .directive('trackList', trackListDirective);

    function trackListReactDirective(reactDirective) {
        return reactDirective('TrackList')
    };

    function trackListDirective($playlistMenu, CorePlayer, PlaylistService, $mdToast) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/trackList.html',
            scope: {
                tracks: '=',
                onTrackClick: '@',
                originToggle: '=',
                listContext: '@'
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

                        if (!track) {
                            throw new Error('trying to add track, but no track to add');
                        }

                        CorePlayer.add(track, true);
                    } else {

                    }

                };

                $scope.playNext = function(track) {

                    CorePlayer.playNext(track);

                    $mdToast.show(
                      $mdToast.simple()
                        .content('Track has been queued up next')
                        .position('bottom right')
                        .hideDelay(1000)
                    );
                };

                $scope.handleRemoveTrack = function(track) {
                    var index = _.findIndex(CorePlayer.tracks, function(iterator) {
                        return iterator.id === track.id;
                    });

                    //since $scope.tracks is always a decorated array, means we have no reference to it
                    //we have to remove track in this to update the UI
                    $scope.tracks.splice(index, 1);
                    CorePlayer.remove(index);
                };

                $scope.starTrack = function(track) {
                    track.starred = !!!track.starred;

                    if (track.starred) {
                        PlaylistService.starTrack(track);
                    } else {
                        PlaylistService.unstarTrack(track);
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
