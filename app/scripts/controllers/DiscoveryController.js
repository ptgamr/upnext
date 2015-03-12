(function() {

    angular.module('soundCloudify')
            .controller('DiscoveryController', ['$mdSidenav'        , DiscoveryController])

    function DiscoveryController($mdSidenav) {
        var vm = this;
        vm.selectedIndex = 0;
    }
}());