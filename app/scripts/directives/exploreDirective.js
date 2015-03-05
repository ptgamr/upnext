(function(){
    'use strict';

    angular.module('soundCloudify')
        .directive('explore', musicExploreDirective);

    function musicExploreDirective(Category) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/views/explore.html',
            scope: true,
            link: function($scope) {
                Category.getList().success(function(categories) {
                    $scope.categories = categories['music'] || [];
                });

                $scope.$watch('chosenCategory', function(val) {
                    if (val) {
                        Category.getTracks(val).success(function(data) {
                            $scope.tracks = data.tracks || [];
                        })
                    }
                });
            }
        };
    }
}());
