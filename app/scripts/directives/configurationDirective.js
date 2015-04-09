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
                templateUrl: 'scripts/views/configuration.html',
                controller: DialogController
            });

            function DialogController(scope, $mdDialog) {

                chrome.storage.sync.get('scConfig', function(data) {
                    scope.configuration = data['scConfig'] || {showNotification: true, scrobbleDuration: 30};
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
