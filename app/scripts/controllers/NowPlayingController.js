(function() {

    angular.module('soundCloudify')
            .controller('NowPlayingController', NowPlayingController)

    function NowPlayingController(Category, $mdDialog, PlaylistService, CorePlayer, TrackAdapter, $timeout) {
        var vm = this;

        vm.player = CorePlayer;

        //give PlaylistService 1000ms to load
        //We need it to get the starred information for the track
        //FIXME: better to make this process async. but ok for now
        var delay = !PlaylistService.isReady() ? 1000 : 300;

        //need a little delay here to make smother transition when changing tab
        $timeout(function() {
            vm.tracks = TrackAdapter.decorateStar(CorePlayer.tracks);
        }, delay);

        vm.saveStream = function($event) {
            
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
                        '      <label>New Playlist</label>'+
                        '      <input ng-model="newPlaylistName" type="text" placeholder="Enter playlist name">' +
                        '    </md-input-container>'+
                        '  </md-content>' +
                        '  <div class="md-actions">' +
                        '    <md-button ng-click="cancel()">' +
                        '      Cancel' +
                        '    </md-button>' +
                        '    <md-button class="md-primary" ng-click="createPlaylist()">' +
                        '      Create Playlist' +
                        '    </md-button>' +
                        '  </div>' +
                        '</md-dialog>',
                    locals: {
                        player: vm.player
                    },
                    controller: DialogController
                });

                function DialogController(scope, $mdDialog, player) {
                    scope.newPlaylistName = '';
                    scope.addNew = function($event) {}
                    scope.createPlaylist = function() {
                        if (!scope.newPlaylistName) {
                            return;
                        }
                        var newPlaylist = PlaylistService.newPlaylist(scope.newPlaylistName);
                        scope.newPlaylistName = '';

                        PlaylistService.addTracksToPlaylist(player.tracks, newPlaylist);

                        $mdDialog.hide();
                    };

                    scope.cancel = function() {
                        $mdDialog.hide();   
                    };
                }
            }              

        };

        vm.clearStream = function($event) {
            var confirm = $mdDialog.confirm()
                .title('Would you like clear the current stream?')
                .content('Tips: You might want to save it as a playlist')
                .ok('Please do it!')
                .cancel('No, I don\'t')
                .targetEvent($event);
            $mdDialog.show(confirm).then(function() {
                vm.player.clear();
            }, function() {
                //vm.alert = 'You decided to keep your debt.';
            });
        }
    }
}());