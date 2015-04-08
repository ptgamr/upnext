(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('scdPlayer', soundCloudifyPlayerDirective);

    function soundCloudifyPlayerDirective(CorePlayer) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/player.html',
            link: function(scope, element, attrs) {

                scope.player = CorePlayer;
                scope.volume = scope.player.state.volume * 100;
                scope.manualScrobble = {
                    track: '',
                    artist: ''
                };

                scope.sendManualScrobble = function() {

                    if (!scope.manualScrobble.track || !scope.manualScrobble.artist) {
                        return;
                    }
                    CorePlayer.sendManualScrobble(scope.manualScrobble);
                };

                scope.doSeek = function(e) {
                    var xpos = e.offsetX / e.target.offsetWidth;
                    CorePlayer.seek(xpos);
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
