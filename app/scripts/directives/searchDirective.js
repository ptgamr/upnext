(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('search', searchDirective);

    function searchDirective(SearchService, Paginator, $filter) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/search.html',
            scope: true,
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {
                
                var soundcloudPaginator, youtubePaginator, tempSearchResult = [], cacheForFilter;

                $scope.search = {
                    term: localStorage.getItem('lastSearchTerm') || ''
                };

                $scope.toggle = {
                    soundcloud: true,
                    youtube: true
                };

                $scope.player = playerController;

                $scope.mixedResults = [];

                function soundcloudPagingFunction(paginationModel) {
                    return SearchService.search($scope.search.term, paginationModel);
                }

                function youtubePagingFunction(paginationModel) {
                    return SearchService.searchYoutube($scope.search.term, paginationModel);
                }

                function concatAndMixedResult(data) {
                    if (tempSearchResult.length) {
                        tempSearchResult = tempSearchResult.concat(data);
                        $scope.mixedResults = $scope.mixedResults.concat(_.shuffle(tempSearchResult));
                        tempSearchResult = [];
                    } else {
                        tempSearchResult = tempSearchResult.concat(data);
                    }
                }

                $scope.soundcloudPaginator = Paginator.getInstance({
                    limit: 10,
                    getFirstPage: false,
                    pagingFunction: soundcloudPagingFunction,
                    pagingSuccess: concatAndMixedResult
                });

                $scope.youtubePaginator = Paginator.getInstance({
                    limit: 10,
                    getFirstPage: false,
                    pagingFunction: youtubePagingFunction,
                    pagingSuccess: concatAndMixedResult
                });

                $scope.getMore = function(newSearch) {
                    if (newSearch) {
                        $scope.mixedResults = [];
                        localStorage.setItem('lastSearchTerm', $scope.search.term);
                        $scope.soundcloudPaginator.reset();
                        $scope.youtubePaginator.reset();
                    }

                    $scope.soundcloudPaginator.moreRows();
                    $scope.youtubePaginator.moreRows();

                    $scope.promises = [$scope.soundcloudPaginator.lastPromise, $scope.youtubePaginator.lastPromise];
                };

                $scope.onKeyPress = function(keyEvent) {
                    if (keyEvent.which === 13) {
                        $scope.getMore(true);
                    }
                };

                $scope.hasMoreRow = function() {
                    return $scope.soundcloudPaginator.hasMoreRow && $scope.youtubePaginator.hasMoreRow;
                };
            }
        };
    }
}());
