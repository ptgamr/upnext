(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('search', searchDirective);

    function searchDirective(SearchService) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/search.html',
            scope: true,
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {
                
                $scope.searchTerm = '';

                $scope.player = playerController;

                $scope.doSearch = function() {

                    if (!$scope.searchTerm) return;

                    $scope.isLoading = true;

                    SearchService.search($scope.searchTerm).success(function(results) {
                        $scope.results = results.collection || [];
                        $scope.isLoading = false;
                    });

                };

                $scope.doSearchYoutube = function() {

                    if (!$scope.searchTermYoutube) return;

                    $scope.isLoading = true;

                    SearchService.searchYoutube($scope.searchTermYoutube).success(function(results) {
                        console.log(results);
                        // $scope.results = results.collection || [];
                        // $scope.isLoading = false;
                    });

                };

                $scope.onKeyPress = function(keyEvent) {
                    if (keyEvent.which === 13) {
                        $scope.doSearch();
                    }
                }

                $scope.onKeyPressYoutube = function(keyEvent) {
                    if (keyEvent.which === 13) {
                        $scope.doSearchYoutube();
                    }   
                }
            }
        };
    }
}());
