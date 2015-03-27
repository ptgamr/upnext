(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Category", CategoryService);

    function CategoryService($http, CLIENT_ID, TrackAdapter, $q){
        
        return {
            getList: getList,
            getTracks: getTracks
        };

        function getList(){
            var params = { limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };
            return $http.get('https://api-v2.soundcloud.com/explore/categories', { params: params });
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
