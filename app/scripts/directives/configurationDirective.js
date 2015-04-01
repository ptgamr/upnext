(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('configuration', ConfigurationDirective);

    function ConfigurationDirective() {
        return {
            restrict: 'E',
            template: '<span><md-button title="about" ng-click="vm.showInformation($event)"><md-icon md-font-icon="icon ion-ios-information"></md-icon></md-button><md-button title="settings" ng-click="vm.openConfigurationDialog($event)"><md-icon md-font-icon="icon ion-gear-b"></md-icon></md-button></span>',
            scope: {},
            controller: ConfigurationController,
            controllerAs: 'vm'
        };
    }

    function ConfigurationController($mdDialog) {
        
        var vm = this;

        vm.openConfigurationDialog = function($event) {
            showDialog($event);
        };

        vm.showInformation = function($event) {
            showInfoDialog($event);
        };

        function showDialog($event) {

            var parentEl = angular.element(document.body);

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                template:
                    '<md-dialog aria-label="Configuration dialog">' +
                    '  <md-content>'+
                    '    <h2>Settings</h2>'+
                    '    <md-checkbox class="md-primary" ng-model="configuration.showNotification" aria-label="Toggle Desktop Notification">'+
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

                chrome.storage.sync.get('scConfig', function(data) {
                    scope.configuration = data['scConfig'] || {showNotification: true};
                });

                scope.$watch('configuration', function(newConf, oldConf) {
                    if (newConf && oldConf) {
                        var configObj = {};
                        configObj['scConfig'] = newConf;
                        chrome.storage.sync.set(configObj);
                    }
                }, true);

                scope.close = function() {
                    $mdDialog.hide();   
                };
            }
        };

        function showInfoDialog($event) {

            var parentEl = angular.element(document.body);

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'scripts/views/info.html',
                locals: {
                    player: vm.player
                },
                controller: DialogController
            });

            function DialogController(scope, $mdDialog, player) {
                scope.close = function() {
                    $mdDialog.hide();   
                };
            }
        };
    }
}());
