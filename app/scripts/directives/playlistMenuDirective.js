(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('playlistMenu', playlistMenuDirective)
        .directive('playlistChoser', playlistChoserDirective);

    function playlistMenuDirective(PlaylistService) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/playlist-menu.html',
            scope: {},
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
                }

            }
        };
    }

    function playlistChoserDirective($compile, $document) {
        
        var singletonMenu,
            menuTemplate = '<playlist-menu id="singleton-playlist-menu"></playlist-menu>';

        return {
            restrict: 'A',
            link: function($scope, element, attrs) {

                if (!singletonMenu) {
                    singletonMenu = $compile(menuTemplate)($scope, function(singletonMenu, scope) {
                        angular.element(document).find('body').eq(0).append(singletonMenu);
                    });
                }

                //FIXME
                var container =  element.parent().parent();

                element.on('click', function(event) {
                    if (singletonMenu.hasClass('open')) {
                        close(event);
                    } else {
                        open(event);
                    }
                });

                function determinePosition(container) {

                    var position = '';

                    var documentRect = $document[0].documentElement.getBoundingClientRect(),
                        elementRect = element[0].getBoundingClientRect(),
                        containerRect = container[0].getBoundingClientRect(),
                        menuRect = singletonMenu[0].getBoundingClientRect(),

                        menuWidth = menuRect.width,
                        menuHeight = menuRect.height,

                        elementRelativeLeft = elementRect.left - containerRect.left,
                        elementRelativeTop = elementRect.top - containerRect.top;

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
                            top = elementRelativeTop - menuHeight;
                            left = elementRelativeLeft - menuWidth;
                            break;
                        case 'topright':
                            top = elementRelativeTop - menuHeight;
                            left = elementRelativeLeft + elementRect.width;
                            break;
                        case 'bottomleft':
                            top = elementRelativeTop + elementRect.height;
                            left = elementRelativeLeft - menuWidth;
                            break;
                        case 'bottomright':
                            top = elementRelativeTop + elementRect.height;
                            left = elementRelativeLeft + elementRect.width;
                            break;
                    }

                    return {top: top, left: left};
                }

                function open(event) {
                    singletonMenu.addClass('open');

                    container.append(singletonMenu);

                    var position = determinePosition(container);

                    singletonMenu.css('top', position.top + 'px');
                    singletonMenu.css('left', position.left + 'px');
                }

                function close() {
                    singletonMenu.removeClass('open');
                }


                $scope.$on('$destroy', function() {
                    singletonMenu = null;
                });

                // $document.bind('click', function(event) {
                //     console.log('close menu');
                //     close();    
                // });
            }
        }
    }
}());
