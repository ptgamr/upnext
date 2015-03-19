(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('search', searchDirective);

    function searchDirective(SearchService, Paginator) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/search.html',
            scope: true,
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {
                
                var soundcloudPaginator, youtubePaginator;

                $scope.searchTerm = localStorage.getItem('lastSearchTerm') || '';
                $scope.toggle = {
                    soundcloud: true,
                    youtube: true
                };

                $scope.player = playerController;
                $scope.mixedResults = [];

                function soundcloudPagingFunction(paginationModel) {
                    return SearchService.search($scope.searchTerm, paginationModel);
                }

                function soundCloudPagingSuccess(data) {
                    $scope.mixedResults = $scope.mixedResults.concat(data);
                }

                function youtubePagingFunction(paginationModel) {
                    return SearchService.searchYoutube($scope.searchTerm, paginationModel);
                }

                function youtubePagingSucces(data) {
                    $scope.mixedResults = $scope.mixedResults.concat(data);
                }

                $scope.getMore = function(newSearch) {
                    if (!newSearch && soundcloudPaginator && youtubePaginator) {
                        soundcloudPaginator.moreRows();
                        youtubePaginator.moreRows();
                    } else {
                        
                        $scope.mixedResults = [];

                        localStorage.setItem('lastSearchTerm', $scope.searchTerm);

                        soundcloudPaginator = Paginator.getInstance({
                            limit: 10,
                            pagingFunction: soundcloudPagingFunction,
                            pagingSuccess: soundCloudPagingSuccess
                        });

                        youtubePaginator = Paginator.getInstance({
                            limit: 10,
                            pagingFunction: youtubePagingFunction,
                            pagingSuccess: youtubePagingSucces
                        });
                    }
                }

                $scope.onKeyPress = function(keyEvent) {
                    if (keyEvent.which === 13) {
                        $scope.getMore(true);
                    }
                }

                $scope.hasMoreRow = function() {
                    return soundcloudPaginator && youtubePaginator && soundcloudPaginator.hasMoreRow && youtubePaginator.hasMoreRow;
                }
            }
        };
    }
}());
