(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('configuration', ConfigurationDirective);

    function ConfigurationDirective($timeout) {
        return {
            restrict: 'E',
            template: '<span>' +
                        '<md-button title="Donate" ng-click="vm.donate($event)"><md-icon md-font-icon="icon ion-heart"></md-icon></md-button>' +
                        '<md-button title="share" ng-click="vm.shareTwitter($event)"><md-icon md-font-icon="icon ion-social-twitter"></md-icon></md-button>' +
                        '<md-button title="share" ng-click="vm.shareFacebook($event)"><md-icon md-font-icon="icon ion-social-facebook"></md-icon></md-button>' +
                        '<md-button title="about" ng-click="vm.showInformation($event)"><md-icon md-font-icon="icon ion-ios-information"></md-icon></md-button>' +
                        '<md-button title="settings" ng-click="vm.openConfigurationDialog($event)"><md-icon md-font-icon="icon ion-gear-b"></md-icon></md-button>' +
                      '</span>',
            scope: {},
            controller: ConfigurationController,
            controllerAs: 'vm',
            link: function(scope, element) {
                var hasShownDonation = localStorage.getItem('shownDonation129');

                if (!hasShownDonation) {
                    $timeout(function() {
                        scope.vm.showDonationDialog({
                            target: element.find('button')[0]
                        });

                        localStorage.setItem('shownDonation129', true);
                    }, 500);
                }
            }
        };
    }

    function ConfigurationController($window, $mdDialog, $rootScope, CorePlayer, GATracker) {

        var vm = this;

        vm.showDonationDialog = showDonationDialog;

        $rootScope.$on('sync.start', function() {
            vm.syncing = true;
        });

        $rootScope.$on('sync.completed', function() {
            vm.syncing = false;
        });

        vm.openConfigurationDialog = showDialog;
        vm.showInformation = showInfoDialog;
        vm.donate = showDonationDialog;

        vm.shareTwitter = function() {
            var twitterURL = 'http://twitter.com/intent/tweet?text=';
            var shareText;

            if (CorePlayer.state.currentTrack) {
                shareText = 'I\'m listening to "' + CorePlayer.state.currentTrack.title + '" with @upnextplayer #upnext https://goo.gl/oybyjt';
            } else {
                shareText = '#UpNext: Sweet YouTube-and-SoundCloud powered music player extension for Chrome  https://goo.gl/oybyjt';
            }

            $window.open(twitterURL + encodeURIComponent(shareText), '_blank');
        };

        vm.shareFacebook = function() {
            var facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?u=';
            $window.open(facebookShareUrl + encodeURIComponent('https://goo.gl/3PnQrL'), '_blank');
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
                    scope.configuration = data.scConfig || {showNotification: true, scrobbleDuration: 30};
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

        function showDonationDialog($event) {

            var parentEl = angular.element(document.body);
            GATracker.trackCustomEvent('donation', 'show donation dialog');

            $mdDialog.show({
                parent: parentEl,
                targetEvent: $event,
                templateUrl: 'scripts/views/donation.html',
                controller: DialogController
            });

            function DialogController(scope, $mdDialog) {
                scope.close = function() {
                    $mdDialog.hide();
                };

                scope.donate = function() {
                    GATracker.trackCustomEvent('donation', 'click donate button');
                    $window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=anh%2etrinhtrung%40gmail%2ecom&lc=VN&item_name=UpNext%20Chrome%20Extension&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted');
                };
            }
        }
    }
}());
