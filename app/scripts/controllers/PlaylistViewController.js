(function() {

    angular.module('soundCloudify')
            .controller('PlaylistViewController', PlaylistViewController)

    function PlaylistViewController($state, $stateParams, PlaylistService, StarService) {
        var vm = this;

        vm.playlistIndex = $stateParams.playlistIndex;

        if (!vm.playlistIndex) throw new Error('PlaylistViewController: playlistIndex is undefined');

        if (vm.playlistIndex >= 0) {
            vm.playlist = PlaylistService.getPlaylist(vm.playlistIndex);
            vm.playlistTracks = _.filter(vm.playlist.tracks, function(track) {
                return !track.deleted;
            });
        } else {
            vm.playlist = {
                name: 'Starred',
                tracks: []
            };
            StarService.getTracks().then(function(tracks) {
                vm.playlistTracks = tracks;
            });
        }


		if (!vm.playlist) throw new Error('PlaylistViewController: playlist not found at index = ' + vm.playlistIndex);        

		vm.backToPlaylist = function() {
            $state.go('playlist.list');
        };
    }

}());