(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('playlistMenu', playlistMenuDirective)
        .service('$playlistMenu', playlistMenuService);

    function playlistMenuDirective($rootScope, PlaylistService, $mdToast) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/playlist-menu.html',
            controller: function($scope, PlaylistService) {
                
                PlaylistService
                    .getList()
                    .then(function(data) {
                        $scope.playlists = data;
                    });

                $scope.newPlaylistName = '';

                $scope.addNew = function(keyEvent) {

                    if (keyEvent.which !== 13) {
                        return;
                    }

                    if (!$scope.newPlaylistName) return;
                    PlaylistService.newPlaylist($scope.newPlaylistName);

                    $scope.newPlaylistName = '';
                };

                $scope.remove = function(index) {
                    PlaylistService.removePlaylist(index);
                };

                $scope.addTrackToPlaylist = function(playlistIndex) {

                    if (!$rootScope.trackToAdd) {
                        throw new Error('No track to add');
                    }

                    //$scope.trackToAdd is taken from the playlistChoser directive's scope
                    PlaylistService.addTrackToPlaylist($rootScope.trackToAdd, playlistIndex);

                    $rootScope.$emit('playlist.menu.close');

                    var parentEl = angular.element(document.querySelector('#tab-content'));

                    $mdToast.show(
                      $mdToast.simple()
                        .content('Track has been added to playlist successfully')
                        .position('bottom right')
                        .hideDelay(1000)
                        .parent(parentEl)
                    );
                };
            }
        };
    }

    function playlistMenuService($rootScope, $document) {

        var singletonMenu = angular.element(document.getElementById('singleton-playlist-menu'));
        var isMenuActive = false;
        var backdrop;
        var element;

        $rootScope.$on('playlist.menu.close', function() {
            if (isMenuActive) {
                closeMenu();
            }
        });

        return {
            show: show
        };

        function show(config) {
            element = config.element;
            var trackToAdd = config.trackToAdd;

            if (!element) {
                throw new Error('Element is missing when open playlist menu');
            }

            if (!trackToAdd) {
                throw new Error('trackToAdd is missing when open playlist menu');
            }

            openMenu(trackToAdd);
        }

        function openMenu(trackToAdd) {
            
            backdrop = angular.element('<md-backdrop class="md-dialog-backdrop md-opaque md-default-theme">');
            angular.element(document).find('body').append(backdrop);

            backdrop.on('click', closeMenu);

            singletonMenu.addClass('open');

            var position = determinePosition();

            singletonMenu.css('top', position.top + 'px');
            singletonMenu.css('left', position.left + 'px');

            isMenuActive = true;
            element.parent().addClass('active');
            $rootScope.trackToAdd = trackToAdd;
        }

        function closeMenu() {
            singletonMenu.removeClass('open');
            backdrop.remove();
            isMenuActive = false;
            element.parent().removeClass('active');
        }

        function determinePosition() {

            var position = '';

            var documentRect = $document[0].documentElement.getBoundingClientRect(),
                elementRect = element[0].getBoundingClientRect(),
                menuRect = singletonMenu[0].getBoundingClientRect(),

                menuWidth = menuRect.width,
                menuHeight = menuRect.height;

            if (elementRect.top - menuHeight >= 0) {
                position += 'top';
            } else {
                position += 'bottom';
            }

            if (elementRect.left + elementRect.width + menuWidth > documentRect.width) {
                position += 'left';
            } else {
                position += 'right';
            }

            var top = 0, left = 0;

            switch(position) {
                case 'topleft':
                    top = elementRect.top - menuHeight;
                    left = elementRect.left - menuWidth;
                    break;
                case 'topright':
                    top = elementRect.top - menuHeight;
                    left = elementRect.left + elementRect.width;
                    break;
                case 'bottomleft':
                    top = elementRect.top + elementRect.height;
                    left = elementRect.left - menuWidth;

                    if (top + menuHeight > documentRect.height) {
                        top -= (top + menuHeight - documentRect.height) + 10;
                    }
                    break;
                case 'bottomright':
                    top = elementRect.top + elementRect.height;
                    left = elementRect.left + elementRect.width;

                    if (top + menuHeight > documentRect.height) {
                        top -= (top + menuHeight - documentRect.height) + 10;
                    }
                    break;
            }

            return {top: top, left: left};
        }

    }

    function playlistChoserDirective($rootScope, $document, $animate) {
        
        var singletonMenu;

        return {
            restrict: 'A',
            scope: {
                trackToAdd: '='
            },
            link: function($scope, element, attrs) {

                if (!singletonMenu) {
                    singletonMenu = angular.element(document.getElementById('singleton-playlist-menu'));
                }

                var isMenuActive = false;

                var backdrop;

                element.on('click', function(event) {
                    if (!singletonMenu) {
                        throw new Error('Menu not found for showing');
                    }

                    if (singletonMenu.hasClass('open')) {
                        closeMenu();
                    } else {
                        openMenu(event);
                    }
                });

                $scope.$on('playlist.menu.close', function() {
                    if (isMenuActive) {
                        closeMenu();
                    }
                });


                function openMenu(event) {
                    
                    backdrop = angular.element('<md-backdrop class="md-dialog-backdrop md-opaque md-default-theme">');
                    angular.element(document).find('body').append(backdrop);

                    backdrop.on('click', closeMenu);

                    singletonMenu.addClass('open');

                    var position = determinePosition();

                    singletonMenu.css('top', position.top + 'px');
                    singletonMenu.css('left', position.left + 'px');

                    isMenuActive = true;
                    element.parent().addClass('active');
                    $rootScope.trackToAdd = $scope.trackToAdd;
                }

                function closeMenu() {
                    singletonMenu.removeClass('open');
                    backdrop.remove();
                    isMenuActive = false;
                    element.parent().removeClass('active');
                }

                function determinePosition() {

                    var position = '';

                    var documentRect = $document[0].documentElement.getBoundingClientRect(),
                        elementRect = element[0].getBoundingClientRect(),
                        menuRect = singletonMenu[0].getBoundingClientRect(),

                        menuWidth = menuRect.width,
                        menuHeight = menuRect.height;

                    if (elementRect.top - menuHeight >= 0) {
                        position += 'top';
                    } else {
                        position += 'bottom';
                    }

                    if (elementRect.left + elementRect.width + menuWidth > documentRect.width) {
                        position += 'left';
                    } else {
                        position += 'right';
                    }

                    var top = 0, left = 0;

                    switch(position) {
                        case 'topleft':
                            top = elementRect.top - menuHeight;
                            left = elementRect.left - menuWidth;
                            break;
                        case 'topright':
                            top = elementRect.top - menuHeight;
                            left = elementRect.left + elementRect.width;
                            break;
                        case 'bottomleft':
                            top = elementRect.top + elementRect.height;
                            left = elementRect.left - menuWidth;

                            if (top + menuHeight > documentRect.height) {
                                top -= (top + menuHeight - documentRect.height) + 10;
                            }
                            break;
                        case 'bottomright':
                            top = elementRect.top + elementRect.height;
                            left = elementRect.left + elementRect.width;

                            if (top + menuHeight > documentRect.height) {
                                top -= (top + menuHeight - documentRect.height) + 10;
                            }
                            break;
                    }

                    return {top: top, left: left};
                }

                // $scope.closeMenu = function() {
                //     closeMenu();
                // };

                // $scope.$on('$destroy', function() {
                //     singletonMenu = null;
                // });

            }
        }
    }
}());
