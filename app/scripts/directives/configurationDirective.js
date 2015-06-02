(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('configuration', ConfigurationDirective);

    function ConfigurationDirective() {
        return {
            restrict: 'E',
            template: '<span>' +
                        '<md-button title="share" ng-click="vm.shareTwitter($event)"><md-icon md-font-icon="icon ion-social-twitter"></md-icon></md-button>' +
                        '<md-button title="share" ng-click="vm.shareFacebook($event)"><md-icon md-font-icon="icon ion-social-facebook"></md-icon></md-button>' +
                        '<md-button title="about" ng-click="vm.showInformation($event)"><md-icon md-font-icon="icon ion-ios-information"></md-icon></md-button>' +
                        '<md-button title="settings" ng-click="vm.openConfigurationDialog($event)"><md-icon md-font-icon="icon ion-gear-b"></md-icon></md-button>' +
                      '</span>',
            scope: {},
            controller: ConfigurationController,
            controllerAs: 'vm'
        };
    }

    function ConfigurationController($window, $mdDialog, $rootScope, CorePlayer) {

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

        vm.shareTwitter = function($event) {
            var twitterURL = 'http://twitter.com/intent/tweet?text=';
            var shareText;

            if (CorePlayer.state.currentTrack) {
                shareText = 'I\'m listening to "' + CorePlayer.state.currentTrack.title + '" with @SoundCloudify https://goo.gl/ljw69q';
            } else {
                shareText = "#SoundCloudify: Sweet YouTube-and-SoundCloud powered music player extension for Chrome  https://goo.gl/ljw69q";
            }

            $window.open(twitterURL + encodeURIComponent(shareText), '_blank');
        };

        vm.shareFacebook = function($event) {
            var facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?u=';
            $window.open(facebookShareUrl + encodeURIComponent('https://goo.gl/OW3dz8'), '_blank');
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
        }

        function showInfoDialog($event) {

            var parentEl = angular.element(document.body);

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'scripts/views/info.html',
                controller: DialogController
            });

            function DialogController(scope, $mdDialog) {
                scope.close = function() {
                    $mdDialog.hide();
                };
            }
        }
    }
}());
