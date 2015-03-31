(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('configuration', ConfigurationDirective);

    function ConfigurationDirective() {
        return {
            restrict: 'E',
            template: '<md-button ng-click="vm.openConfigurationDialog($event)"><md-icon md-font-icon="icon ion-gear-b"></md-icon></md-button>',
            scope: true,
            controller: ConfigurationController,
            controllerAs: 'vm'
        };
    }

    function ConfigurationController($mdDialog) {
        
        var vm = this;

        vm.openConfigurationDialog = function($event) {
            showDialog($event);
        };

        function showDialog($event) {

            var parentEl = angular.element(document.body);

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                template:
                    '<md-dialog aria-label="Configuration dialog">' +
                    '  <md-content>'+
                    '    <h2>Options</h2>'+
                    '    <md-checkbox class="md-primary" ng-model="showNotification" aria-label="Toggle Desktop Notification">'+
                    '      Show Desktop Notification'+
                    '    </md-checkbox>'+
                    '  </md-content>' +
                    '  <div class="md-actions">' +
                    '    <md-button ng-click="close()">' +
                    '      Close' +
                    '    </md-button>' +
                    '  </div>' +
                    '</md-dialog>',
                locals: {
                    player: vm.player
                },
                controller: DialogController
            });

            function DialogController(scope, $mdDialog, player) {
                scope.showNotification = true;
                scope.close = function() {
                    $mdDialog.hide();   
                };
            }
        };
    }
}());
