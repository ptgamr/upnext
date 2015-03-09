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
                        Category.getTracks(val).success(function(data) {
                            $scope.tracks = data.tracks || [];
                        })
                    }
                });

                $scope.addTrack = function(track) {
                    playerController.add(track, true);
                };
            }
        };
    }
}());
