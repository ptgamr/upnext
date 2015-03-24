(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('nowPlaying', nowPlayingDirective);

    function nowPlayingDirective(Category, $mdDialog, PlaylistService, CorePlayer) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/nowPlaying.html',
            scope: true,
            link: function($scope, element, attrs) {

                $scope.player = CorePlayer;

                $scope.saveStream = function($event) {
                    
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
                                '    <md-button ng-click="createPlaylist()">' +
                                '      Create Playlist' +
                                '    </md-button>' +
                                '  </div>' +
                                '</md-dialog>',
                            locals: {
                                player: $scope.player
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
                            }
                        }
                    }              

                };

                $scope.clearStream = function($event) {
                    var confirm = $mdDialog.confirm()
                        .title('Would you like clear the current stream?')
                        .content('You might want to save it as a playlist')
                        .ariaLabel('Lucky day')
                        .ok('Please do it!')
                        .cancel('No, I don\'t')
                        .targetEvent($event);
                    $mdDialog.show(confirm).then(function() {
                        $scope.player.clear();
                    }, function() {
                        //$scope.alert = 'You decided to keep your debt.';
                    });
                }
            }
        };
    }
}());
