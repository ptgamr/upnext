(function() {

    angular.module('soundCloudify')
            .controller('PlaylistController', PlaylistController)

    function PlaylistController($mdToast, $state, PlaylistService, CorePlayer, GATracker) {
        var vm = this;

        PlaylistService
            .getList()
            .then(function(data) {
                vm.playlists = data;
            });

        vm.newPlaylistName = '';

        vm.addNew = function(keyEvent) {

            if (keyEvent.which !== 13) {
                return;
            }

            if (!vm.newPlaylistName) return;
            PlaylistService.newPlaylist(vm.newPlaylistName);

            vm.newPlaylistName = '';

            GATracker.trackPlaylist('add new');
        };

        vm.remove = function($event, index) {
            $event.stopPropagation();
            PlaylistService.removePlaylist(index);

            GATracker.trackPlaylist('remove at', index);
        };

        vm.playAll = function($event, index) {
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

            GATracker.trackPlaylist('play all', index);
        };

        vm.selectPlaylist = function(index) {
            $state.go('playlist.view', {playlistIndex: index});
        };
    }
}());