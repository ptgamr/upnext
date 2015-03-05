(function() {

    angular.module('soundCloudify')
            .controller('DiscoveryController', [DiscoveryController])

    function DiscoveryController() {

        var vm = this;

        vm.selectedIndex = 0;
    }

    soundCloudify = angular.module('soundCloudify');
    soundCloudify.controller('MainController', ['$http', '$location', 'CLIENT_ID', MainController]);
}());