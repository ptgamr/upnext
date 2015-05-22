(function() {

    angular.module('soundCloudify')
            .controller('PlaylistController', PlaylistController)

    function PlaylistController($mdToast, $mdDialog, $state, $scope, PlaylistService, PlaylistImporter, StarService, CorePlayer, GATracker) {
        var vm = this;

        vm.playlists = PlaylistService.getList();
        vm.starredListLength = StarService.getLength();

        $scope.$on('starredList.ready', function() {
            vm.starredListLength = StarService.getLength();
        });

        vm.newPlaylistName = '';

        vm.addNew = function(keyEvent) {

            if (keyEvent.which !== 13) {
                return;
            }

            if (!vm.newPlaylistName) return;
            PlaylistService.newPlaylist(vm.newPlaylistName).then(function() {
                vm.newPlaylistName = '';
                GATracker.trackPlaylist('add new');
            });
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
                    .parent(angular.element(document.querySelector('#tab-content')))
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

        vm.openImportModal = function($event) {
            showDialog($event);

            function showDialog($event) {
                var parentEl = angular.element(document.body);

                $mdDialog.show({
                    parent: parentEl,
                    targetEvent: $event,
                    template:
                        '<md-dialog aria-label="List dialog">' +
                        '  <md-content>'+
                        '    <md-input-container>'+
                        '      <label>Playlist URL</label>'+
                        '      <input ng-model="playlistUrl" type="text" placeholder="Enter YouTube playlist URL">' +
                        '    </md-input-container>'+
                        '    <md-input-container>'+
                        '      <label>Playlist Name</label>'+
                        '      <input ng-model="newPlaylistName" type="text" placeholder="Enter playlist name">' +
                        '    </md-input-container>'+
                        '  </md-content>' +
                        '  <div class="md-actions">' +
                        '    <md-button ng-click="cancel()">' +
                        '      Cancel' +
                        '    </md-button>' +
                        '    <md-button ng-disabled="true" class="md-primary" ng-click="createPlaylist()">' +
                        '      Import Playlist' +
                        '    </md-button>' +
                        '  </div>' +
                        '</md-dialog>',
                    locals: {
                        //player: vm.player
                    },
                    controller: PlaylistImportDialogController
                });

                function PlaylistImportDialogController(scope, $mdDialog) {
                    scope.newPlaylistName = '';
                    scope.playlistUrl = '';
                    scope.invalidUrl = false;
                    scope.playlistNotFound = false;
                    scope.loadedTracks = null;

                    scope.$watch('playlistUrl', function(newVal, oldVal) {

                        if (newVal && PlaylistImporter.extractPlaylistId(newVal)) {
                            scope.invalidUrl = false;
                            scope.playlistNotFound = false;

                            var playlistId = PlaylistImporter.extractPlaylistId(newVal);

                            if (!playlistId) {
                                scope.invalidUrl = true;
                                return;
                            }

                            PlaylistImporter.fetchPlaylist(playlistId)
                                .then(function(playlist) {

                                    if(playlist) {
                                        scope.newPlaylistName = playlist.name;

                                        PlaylistImporter.fetchPlaylistItems(playlistId)
                                            .then(function(youtubeVideos) {
                                                scope.loadedTracks = youtubeVideos;
                                            });
                                    } else {
                                        scope.playlistNotFound = true;
                                    }

                                }, function() {
                                    scope.playlistNotFound = true;
                                });
                        }
                    });

                    scope.createPlaylist = function() {

                        if (!scope.newPlaylistName) {
                            return;
                        }

                        PlaylistService.newPlaylist(scope.newPlaylistName, vm.loadedTracks || [])
                            .then(function() {
                                $mdDialog.hide();
                            });
                    };

                    scope.cancel = function() {
                        $mdDialog.hide();
                    };
                }
            }
        }
    }
}());