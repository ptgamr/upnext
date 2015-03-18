(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('scdPlayer', soundCloudifyPlayerDirective);

    function soundCloudifyPlayerDirective($mdSidenav, $document) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/player.html',
            require: '^corePlayer',
            link: function(scope, element, attrs, playerController) {

                scope.player = playerController;
                scope.volume = scope.player.state.volume * 100;

                scope.toggleNowPlaying = function() {
                    $mdSidenav('right').toggle()
                        .then(function(){
                            $document.find('md-backdrop').addClass('md-locked-open');
                        });
                };

                scope.isNowPlayingOpen = function() {
                    return $mdSidenav('right').isOpen();
                };

                scope.closeNowPlaying = function() {
                    $mdSidenav('right').toggle()
                };

                scope.doSeek = function(e) {
                    var xpos = e.offsetX / e.target.offsetWidth;
                    playerController.seek(xpos);
                }

                scope.$watch('volume', function(val) {
                    if (val) {
                        scope.player.setVolume(val/100);
                    }
                });
            }
        };
    }
}());
