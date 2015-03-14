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

    function playlistController($scope, PlaylistService) {
        
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

        $scope.remove = function(index) {
            PlaylistService.removePlaylist(index);
        }
    }
}());
