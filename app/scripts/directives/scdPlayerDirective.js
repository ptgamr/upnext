(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('scdPlayer', soundCloudifyPlayerDirective);

    function soundCloudifyPlayerDirective(CorePlayer, $mdDialog) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/player.html',
            link: function(scope, element, attrs) {

                scope.player = CorePlayer;
                scope.volume = scope.player.state.volume * 100;

                scope.openManualScrobble = function($event) {

                    if (CorePlayer.state.currentTrack.scrobbled || CorePlayer.state.currentTrack.lastFmValidate !== false) {
                        return;
                    }

                    $mdDialog.show({
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        templateUrl: 'scripts/views/manualScrobble.html',
                        controller: DialogController
                    });

                    function DialogController(scope, $mdDialog, CorePlayer) {
                        
                        scope.close = function() {
                            $mdDialog.hide();
                        };

                        scope.$on('lastfm.scrobbled', function() {
                            $mdDialog.hide();
                        });

                        scope.$on('lastfm.scrobbled', function() {
                            scope.error = 'Can not scrobble the track you enter';
                        });

                        scope.sendManualScrobble = function() {
                            if (!scope.manualScrobble.track || !scope.manualScrobble.artist) {
                                return;
                            }
                            CorePlayer.sendManualScrobble(scope.manualScrobble);
                        };
                    }
                };

                scope.doSeek = function(e) {
                    var xpos = e.offsetX / e.target.offsetWidth;
                    CorePlayer.seek(xpos);
                };

                scope.getScrobbleTitle = function() {
                    return CorePlayer.state.currentTrack.lastFmValidate === false ?
                                'track unregconized by last.fm, right click to edit' : 
                                CorePlayer.state.currentTrack.scrobbled ?
                                    'track has been scrobbled' :
                                    'last.fm scrobble';
                };

                scope.$watch('volume', function(val) {
                    if (val) {
                        scope.player.setVolume(val/100);
                    }
                });
            }
        };
    }
}());
