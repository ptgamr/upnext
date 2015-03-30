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
        

        $scope.backToPlaylist = function() {
            $scope.selectedPlaylist = null;  
        };
    }
}());
