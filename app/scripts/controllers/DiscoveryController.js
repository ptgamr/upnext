(function() {

    angular.module('soundCloudify')
            .controller('DiscoveryController', DiscoveryController)

    function DiscoveryController($scope, $mdSidenav, $state, $timeout) {
        var vm = this;
        
        var states = ['nowPlaying', 'search', 'playlist', 'charts'];

        var storage = localStorage;

        var activeTab = parseInt(localStorage.getItem('activeTab'));

        vm.selectedIndex = isNaN(activeTab) ? 3 : activeTab;

        vm.onTabSelect = function() {
            $timeout(function() {
                localStorage.setItem('activeTab', vm.selectedIndex);
                $state.go(states[vm.selectedIndex]);
            });
        };
    }
}());