(function() {

    angular.module('soundCloudify')
            .controller('PlaylistViewController', PlaylistViewController)

    function PlaylistViewController($state, $stateParams, PlaylistService) {
        var vm = this;
        vm.playlistIndex = $stateParams.playlistIndex;

        if (!vm.playlistIndex) throw new Error('PlaylistViewController: playlistIndex is undefined');

        vm.playlist = PlaylistService.getPlaylist(vm.playlistIndex);

		if (!vm.playlist) throw new Error('PlaylistViewController: playlist not found at index = ' + vm.playlistIndex);        

		vm.backToPlaylist = function() {
            $state.go('playlist.list');
        };
    }

}());