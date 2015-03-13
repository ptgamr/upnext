(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('playlistMenu', playlistMenuDirective);

    function playlistMenuDirective(PlaylistService) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/playlist-menu.html',
            scope: true,
            link: function($scope, element, attrs) {
                
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

            }
        };
    }
}());
