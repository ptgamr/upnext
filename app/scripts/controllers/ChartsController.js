(function() {

    angular.module('soundCloudify')
            .controller('ChartsController', ChartsController)

    function ChartsController(Category, $state, $scope) {
        var vm = this;

        Category.getUpNextList().then(function(upnextCategories) {
            vm.upnextCategories = upnextCategories;
        });

        Category.getList().then(function(categories) {
            vm.categories = categories;
        });

        vm.playAll = function() {
            $scope.$broadcast('charts.playAll');
        };

        vm.selectCategory = function(category, label, fromUpnext) {
            $state.go('charts.detail', {category: category, label: label, fromUpnext: fromUpnext});
        };

        vm.sanitizeCategory = function(category) {
            return unescape(category).replace(/\+/g, " ");
        };
    }
}());
