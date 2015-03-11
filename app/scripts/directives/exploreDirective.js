(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('explore', musicExploreDirective);

    function musicExploreDirective(Category) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/explore.html',
            scope: true,
            require: '^corePlayer',
            link: function($scope, element, attrs, playerController) {

                Category.getList().success(function(categories) {
                    $scope.categories = categories['music'] || [];
                });

                $scope.fallbackArtwork = chrome.extension.getURL('images/artwork-bar.jpg');

                $scope.$watch('chosenCategory', function(val) {
                    if (val) {
                        $scope.isLoading = true;
                        $scope.tracks = [];
                        Category.getTracks(val).success(function(data) {
                            $scope.isLoading = false;
                            $scope.tracks = data.tracks || [];
                        })
                    }
                });

                $scope.selectCategory = function(category) {
                    $scope.chosenCategory = category;
                };

                $scope.backToTopChart = function() {
                    $scope.chosenCategory = '';  
                }

                $scope.addTrack = function(track) {
                    playerController.add(track, true);
                };

                $scope.sanitizeCategory = function(category) {
                    return unescape(category).replace(/\+/g, " ");
                };
            }
        };
    }
}());
