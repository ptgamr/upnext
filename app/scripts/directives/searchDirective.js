(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('search', searchDirective);

    function searchDirective() {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/search.html',
            scope: true,
            controller: SearchController,
            controllerAs: 'ctrl'
        };
    }

    function SearchController ($scope, SuggestionService, CorePlayer, Paginator, SearchService) {

        var vm = this;
        vm.selectedItem  = null;
        vm.searchText    = null;
        vm.suggest   = suggest;
        vm.search = {
            term: ''
        };

        var soundcloudPaginator, youtubePaginator, tempSearchResult = [], cacheForFilter;

        vm.toggle = JSON.parse(localStorage.getItem('toggle')) || {
            soundcloud: true,
            youtube: true
        };

        $scope.$watch(angular.bind(vm, function () {
            return this.toggle;
        }), function (newVal, oldVal) {
            localStorage.setItem('toggle', JSON.stringify(newVal));
        });

        vm.player = CorePlayer;

        vm.mixedResults = [];

        vm.soundcloudPaginator = Paginator.getInstance({
            limit: 10,
            getFirstPage: false,
            pagingFunction: soundcloudPagingFunction,
            pagingSuccess: concatAndMixedResult
        });

        vm.youtubePaginator = Paginator.getInstance({
            limit: 10,
            getFirstPage: false,
            pagingFunction: youtubePagingFunction,
            pagingSuccess: concatAndMixedResult
        });

        vm.getMore = function(newSearch) {

            if (!vm.search.term) return;

            if (newSearch) {
                vm.mixedResults = [];
                localStorage.setItem('lastSearchTerm', vm.search.term);
                vm.soundcloudPaginator.reset();
                vm.youtubePaginator.reset();
            }

            vm.soundcloudPaginator.moreRows();
            vm.youtubePaginator.moreRows();

            vm.promises = [vm.soundcloudPaginator.lastPromise, vm.youtubePaginator.lastPromise];
        };

        vm.onKeyPress = function(keyEvent) {
            if (keyEvent.which === 13) {
                vm.getMore(true);
            }
        };

        vm.hasMoreRow = function() {
            return vm.mixedResults.length && (vm.soundcloudPaginator.hasMoreRow || vm.youtubePaginator.hasMoreRow);
        };

        function soundcloudPagingFunction(paginationModel) {
            return SearchService.search(vm.search.term, paginationModel);
        }

        function youtubePagingFunction(paginationModel) {
            return SearchService.searchYoutube(vm.search.term, paginationModel);
        }

        function concatAndMixedResult(data) {
            if (tempSearchResult.length) {
                tempSearchResult = tempSearchResult.concat(data);
                vm.mixedResults = vm.mixedResults.concat(tempSearchResult);
                tempSearchResult = [];
            } else {
                tempSearchResult = tempSearchResult.concat(data);

                if (!vm.soundcloudPaginator.hasMoreRow || !vm.youtubePaginator.hasMoreRow) {
                    vm.mixedResults = vm.mixedResults.concat(tempSearchResult);
                }
            }
        }

        function suggest (query) {
            return SuggestionService.suggest(query);
        }
    }
}());
