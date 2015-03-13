(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SearchService", SearchService);

    function SearchService($http, CLIENT_ID){
        
        return {
            search: search
        };

        function search(term){
            var params = { q: term, limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };
            return $http.get('https://api-v2.soundcloud.com/search/tracks', { params: params });
        }
    };

}());
