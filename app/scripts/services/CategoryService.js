(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Category", CategoryService);

    function CategoryService($http, CLIENT_ID, TrackAdapter, $q){

        var cachedCategory = JSON.parse(localStorage.getItem('charts')) || [];
        
        return {
            getList: getList,
            getTracks: getTracks
        };

        function getList(){

            return $q(function(resolve, reject) {

                if (cachedCategory.length) {
                    resolve(cachedCategory);
                } else {
                    var params = { limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };
                    $http.get('https://api-v2.soundcloud.com/explore/categories', { params: params })
                    .success(function(data) {
                        cachedCategory = data['music'] || [];
                        resolve(cachedCategory);

                        localStorage.setItem('charts', JSON.stringify(cachedCategory));
                    });
                }
            });

        }

        function getTracks(category, pagingObject) {
            var params = { limit: pagingObject.limit, offset: pagingObject.skip, linked_partitioning: 1, client_id: CLIENT_ID };

            return $q(function(resolve, reject) {
                $http({
                    url: 'https://api-v2.soundcloud.com/explore/' + category,
                    method: 'GET',
                    params: params,
                    transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                        if (!result || !result.tracks) return [];
                        return {
                            tracks: TrackAdapter.adaptMultiple(result.tracks, 'sc')
                        };
                    })
                }).success(function(data) {
                    resolve(data);
                }).error(function() {
                    reject();
                });
            });
        }
    };

}());
