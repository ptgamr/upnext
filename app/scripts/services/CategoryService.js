(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Category", CategoryService);

    function CategoryService($http, CLIENT_ID, TrackAdapter){
        
        return {
            getList: getList,
            getTracks: getTracks
        };

        function getList(){
            var params = { limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };
            return $http.get('https://api-v2.soundcloud.com/explore/categories', { params: params });
        }

        function getTracks(category) {
            var params = { limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };

            return $http({
                url: 'https://api-v2.soundcloud.com/explore/' + category,
                method: 'GET',
                params: params,
                transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                    if (!result || !result.tracks) return [];
                    return TrackAdapter.adaptMultiple(result.tracks, 'sc');
                })
            });
        }
    };

}());
