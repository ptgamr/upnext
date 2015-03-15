(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SearchService", SearchService);

    function SearchService($http, CLIENT_ID){
        
        return {
            search: search,
            searchYoutube: searchYoutube
        };

        function search(term){
            var params = { q: term, limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };
            return $http.get('https://api-v2.soundcloud.com/search/tracks', { params: params });
        }

        function searchYoutube(term) {

            console.log("Search Youtube");

            var params = {
                key: 'AIzaSyDGbUJxAkFnaJqlTD4NwDmzWxXAk55gFh4',
                type: 'video',
                maxResults: '8',
                part: 'id,snippet',
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
                q: term
            };

            return $http.get('https://www.googleapis.com/youtube/v3/search', {
                params: params
            })
        }
    };

}());
