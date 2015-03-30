(function() {

    angular.module('soundCloudify')
            .controller('ChartsViewController', ChartsViewController)

    function ChartsViewController(Category, $state, $stateParams, CorePlayer, Paginator) {
        var vm = this;
        vm.category = $stateParams.category;

        if (!vm.category) throw new Error('ChartsViewController: category is undefined');

        vm.fallbackArtwork = chrome.extension.getURL('images/artwork-bar.jpg');
        vm.tracks = [];

        vm.paginator = Paginator.getInstance({
            limit: 10,
            getFirstPage: true,
            pagingFunction: function(paginationModel) {
                return Category.getTracks(vm.category, paginationModel);
            },
            pagingSuccess: function(data) {
                vm.tracks = vm.tracks.concat(data);
            }
        });

        vm.paginator.moreRows();

        vm.backToTopChart = function() {
            $state.go('charts.list');
        };
    }
}());