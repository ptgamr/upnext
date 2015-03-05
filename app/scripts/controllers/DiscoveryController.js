(function() {

    angular.module('soundCloudify')
            .controller('DiscoveryController', [DiscoveryController])

    function DiscoveryController() {

        var vm = this;

        vm.selectedIndex = 2;
    }

    soundCloudify = angular.module('soundCloudify');
    soundCloudify.controller('MainController', [DiscoveryController]);
}());