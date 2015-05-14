(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('scdPlayer', soundCloudifyPlayerDirective);

    function soundCloudifyPlayerDirective(CorePlayer, $mdDialog, GATracker) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/player.html',
            link: function(scope, element, attrs) {

                scope.player = CorePlayer;
                scope.volume = scope.player.state.volume * 100;

                scope.openManualScrobble = function($event) {

                    GATracker.trackCustomEvent('lastfm', 'open manual scrobble');

                    if (!CorePlayer.state.scrobbleEnabled || CorePlayer.state.scrobbled || CorePlayer.state.lastFmInvalid !== true) {
                        return;
                    }

                    $mdDialog.show({
                        parent: angular.element(document.body),
                        targetEvent: $event,
                        templateUrl: 'scripts/views/manualScrobble.html',
                        controller: DialogController
                    });

                    function DialogController(scope, $mdDialog, CorePlayer, GATracker) {
                        
                        scope.close = function() {
                            $mdDialog.hide();
                        };

                        scope.$on('lastfm.scrobbled', function() {
                            scope.scrobbling = false;
                            $mdDialog.hide();
                        });

                        scope.$on('lastfm.scrobbled', function() {
                            scope.scrobbling = false;
                            scope.error = 'Can not scrobble the track you enter';
                        });

                        scope.sendManualScrobble = function() {
                            if (!scope.manualScrobble || !scope.manualScrobble.track || !scope.manualScrobble.artist) {
                                return;
                            }
                            scope.scrobbling = true;
                            CorePlayer.sendManualScrobble(scope.manualScrobble);
                            GATracker.trackCustomEvent('lastfm', 'send manual scrobble');
                        };
                    }
                };

                scope.doSeek = function(e) {
                    var xpos = e.offsetX / e.target.offsetWidth;
                    CorePlayer.seek(xpos);
                };

                scope.getScrobbleTitle = function() {
                    return CorePlayer.state.scrobble ? 
                            (
                                CorePlayer.state.currentTrack.lastFmValidate === false ?
                                    'track unregconized by last.fm, right click to edit' : 
                                    CorePlayer.state.currentTrack.scrobbled ?
                                        'track has been scrobbled' :
                                        'last.fm scrobble'
                            ) : 'last.fm scrobble'
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
