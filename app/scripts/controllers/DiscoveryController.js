(function() {

    angular.module('soundCloudify')
            .controller('DiscoveryController', ['$scope', '$mdSidenav'        , DiscoveryController])

    function DiscoveryController($scope, $mdSidenav) {
        var vm = this;
        var storage = localStorage;
        vm.selectedIndex = parseInt(localStorage.getItem('activeTab')) || 0;

        $scope.$watch(angular.bind(vm, function () {
			return this.selectedIndex; // `this` IS the `this` above!!
		}), function (newVal, oldVal) {
			localStorage.setItem('activeTab', newVal);
		});
    }
}());