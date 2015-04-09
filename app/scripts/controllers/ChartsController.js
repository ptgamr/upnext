(function() {

    angular.module('soundCloudify')
            .controller('ChartsController', ChartsController)

    function ChartsController(Category, $state, $scope) {
        var vm = this;

        Category.getList().then(function(categories) {
            vm.categories = categories;
        });

        vm.playAll = function() {
            $scope.$broadcast('charts.playAll');
        };

        vm.selectCategory = function(category) {
            $state.go('charts.detail', {category: category});
        };

        vm.sanitizeCategory = function(category) {
            return unescape(category).replace(/\+/g, " ");
        };
    }
}());