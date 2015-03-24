(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('playlist', playlistDirective);

    function playlistDirective(PlaylistService) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/playlist.html',
            scope: true,
            controller: playlistController
        };
    }

    function playlistController($scope, PlaylistService, CorePlayer, $mdToast) {
        
        PlaylistService
            .getList()
            .then(function(data) {
                $scope.playlists = data;
            });

        $scope.newPlaylistName = '';


        $scope.addNew = function(keyEvent) {

            if (keyEvent.which !== 13) {
                return;
            }

            if (!$scope.newPlaylistName) return;
            PlaylistService.newPlaylist($scope.newPlaylistName);

            $scope.newPlaylistName = '';
        };

        $scope.remove = function($event, index) {
            $event.stopPropagation();
            PlaylistService.removePlaylist(index);
        };

        $scope.playAll = function($event, index) {
            $event.stopPropagation();

            var playlist = PlaylistService.getPlaylist(index);

            if (!playlist.tracks.length) {
                $mdToast.show(
                  $mdToast.simple()
                    .content('No track to play')
                    .position('bottom right')
                    .hideDelay(2000)
                );
                return;
            }

            CorePlayer.playAll(playlist.tracks);
        };

        $scope.selectPlaylist = function(playlist) {
            $scope.selectedPlaylist = playlist;
        };

        $scope.backToPlaylist = function() {
            $scope.selectedPlaylist = null;  
        };
    }
}());
