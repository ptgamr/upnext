(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('configuration', ConfigurationDirective);

    function ConfigurationDirective() {
        return {
            restrict: 'E',
            template: '<span>' +
                        '<md-icon md-font-icon="icon ion-loop" ng-show="vm.syncing"></md-icon>' +
                        '<md-button title="about" ng-click="vm.showInformation($event)"><md-icon md-font-icon="icon ion-ios-information"></md-icon></md-button>' +
                        '<md-button title="settings" ng-click="vm.openConfigurationDialog($event)"><md-icon md-font-icon="icon ion-gear-b"></md-icon></md-button>' +
                      '</span>',
            scope: {},
            controller: ConfigurationController,
            controllerAs: 'vm'
        };
    }

    function ConfigurationController($mdDialog, $rootScope) {

        var vm = this;

        $rootScope.$on('sync.start', function() {
            vm.syncing = true;
        });

        $rootScope.$on('sync.completed', function() {
            vm.syncing = false;
        });

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

                scope.close = function() {
                    $mdDialog.hide();
                };

                scope.save = function() {

                    if (!scope.configuration.scrobbleDuration || isNaN(scope.configuration.scrobbleDuration)) {
                        scope.configuration.scrobbleDuration = 30;
                    }

                    chrome.storage.sync.set({'scConfig': scope.configuration});
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
