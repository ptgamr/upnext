(function() {

    angular.module('soundCloudify')
            .controller('ChartsController', ChartsController)

    function ChartsController(Category, $state) {
        var vm = this;

        Category.getList().success(function(categories) {
            vm.categories = categories['music'] || [];
        });

        vm.selectCategory = function(category) {
            $state.go('charts.detail', {category: category});
        };

        vm.sanitizeCategory = function(category) {
            return unescape(category).replace(/\+/g, " ");
        };
    }
}());