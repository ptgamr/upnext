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

                scope.$watch('player.state.volume', function(val) {
                    scope.player.setVolume(val);
                });
            }
        };
    }
}());
