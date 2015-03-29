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
            controllerAs: 'ctrl',
            link: function($scope, $element, attrs, ctrl) {

            }
        };
    }

    function SearchController ($scope, $q, SuggestionService, CorePlayer, Paginator, SearchService, $filter) {

        var vm = this;
        vm.searchText    = null;
        vm.suggest   = suggest;
        vm.search = {
            term: ''
        };
        vm.showSuggestion = true;

        vm.recentSearch = JSON.parse(localStorage.getItem('recentSearch')) || [];

        var soundcloudPaginator, youtubePaginator, mixedResults = [], cacheForFilter;

        vm.toggle = JSON.parse(localStorage.getItem('toggle')) || {
            soundcloud: true,
            youtube: true
        };

        $scope.$watch(angular.bind(vm, function () {
            return this.toggle;
        }), function (toggle, oldToggle) {
            localStorage.setItem('toggle', JSON.stringify(toggle));
            vm.filteredResults = $filter('filter')(mixedResults, getOriginFilter(toggle));
        }, true);

        vm.player = CorePlayer;

        vm.filteredResults = [];

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

        vm.recentSearchClick = function(term) {
            vm.search.term = term;
            vm.selectedItem = term;
            vm.showSuggestion = false;
            vm.getMore(true);
        };

        $scope.$watch(angular.bind(vm, function () {
            return this.selectedItem;
        }), function (newSelected, oldSelected) {
            console.log('selected change');
            console.log(newSelected);
        });
    
        vm.getMore = function(newSearch) {

            if (!vm.search.term) return;

            if (newSearch) {
                mixedResults = [];
                vm.filteredResults = [];
                vm.recentSearch.unshift(vm.search.term.trim());
                //limit to 5 items
                vm.recentSearch = _.uniq(vm.recentSearch).slice(0,5);
                localStorage.setItem('recentSearch', JSON.stringify(vm.recentSearch));
                vm.soundcloudPaginator.reset();
                vm.youtubePaginator.reset();
            }

            vm.soundcloudPaginator.moreRows();
            vm.youtubePaginator.moreRows();

            vm.promises = [vm.soundcloudPaginator.lastPromise, vm.youtubePaginator.lastPromise];
        };

        vm.hasMoreRow = function() {
            return vm.filteredResults.length && (vm.soundcloudPaginator.hasMoreRow || vm.youtubePaginator.hasMoreRow);
        };

        function soundcloudPagingFunction(paginationModel) {
            return SearchService.search(vm.search.term, paginationModel);
        }

        function youtubePagingFunction(paginationModel) {
            return SearchService.searchYoutube(vm.search.term, paginationModel);
        }

        function concatAndMixedResult(data) {
            mixedResults = mixedResults.concat(data);
            vm.filteredResults = $filter('filter')(mixedResults, getOriginFilter(vm.toggle));
        }

        function suggest (query) {
            return vm.showSuggestion ? SuggestionService.suggest(query) : $q(function(resolve, reject) {
                resolve([]);
                vm.showSuggestion = true;
            });
        }

        function getOriginFilter(toggle) {
            var filter = '';

            if (!toggle) return;

            if (toggle.soundcloud && toggle.youtube) {
                filter = '';
            } else if (toggle.soundcloud) {
                filter += 'sc';
            } else if (toggle.youtube) {
                filter += 'yt';
            }

            return {origin: filter};
        }
    }
}());
