(function() {

    angular.module('soundCloudify')
            .controller('SearchController', SearchController)

    function SearchController ($scope, SearchSingleton) {
        $scope.vm = SearchSingleton;

        $scope.$watch('vm.toggle', function (newVal, oldVal) {
            $scope.vm.onToggled(newVal, oldVal);
        }, true);

        $scope.$watch('vm.search.term', function (newVal, oldVal) {
            if (!newVal) {
                $scope.vm.resetSearch();
            }
        }, true);
    }
}());