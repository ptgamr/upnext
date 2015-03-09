(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('scdPlayer', soundCloudifyPlayerDirective);

    function soundCloudifyPlayerDirective() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/player.html',
            require: '^corePlayer',
            link: function(scope, element, attrs, playerController) {
                scope.player = playerController;
            }
        };
    }
}());
