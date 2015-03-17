(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SearchService", SearchService);

    function appendTransform(defaults, transform) {

        // We can't guarantee that the default transformation is an array
        defaults = angular.isArray(defaults) ? defaults : [defaults];

        // Append the new transformation to the defaults
        return defaults.concat(transform);
    }

    var DEFAULT_LIMIT = 20;


    function SearchService($http, CLIENT_ID, TrackAdapter, $q){
        
        return {
            search: search,
            searchYoutube: searchYoutube
        };

        function search(term){
            var params = { q: term, limit: DEFAULT_LIMIT, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };

            return $http({
                url: 'https://api-v2.soundcloud.com/search/tracks',
                method: 'GET',
                params: params,
                transformResponse: appendTransform($http.defaults.transformResponse, function(result) {
                    if (!result || !result.collection) return [];
                    return TrackAdapter.adaptMultiple(result.collection, 'sc');
                })
            });
        }

        function searchYoutube(term) {

            var defer = $q.defer();

            var params = {
                key: 'AIzaSyDGbUJxAkFnaJqlTD4NwDmzWxXAk55gFh4',
                type: 'video',
                maxResults: DEFAULT_LIMIT,
                part: 'id',
                fields: 'items/id',
                q: term
            };

            $http({
                url: 'https://www.googleapis.com/youtube/v3/search',
                method: 'GET',
                params: params
            }).success(function(result) {
                if (!result || !result.items) defer.resolve([]);

                var ids = result.items.map(function(item) {
                    return item.id.videoId;
                });

                var parts = ['id', 'snippet', 'statistics', 'status'];
                var fields = [
                    'items/id',
                    'items/snippet/title',
                    'items/snippet/thumbnails',
                    'items/statistics/viewCount',
                    'items/statistics/likeCount',
                    'items/status/embeddable'
                ];

                var secondRequestParams = {
                    key: 'AIzaSyDGbUJxAkFnaJqlTD4NwDmzWxXAk55gFh4',
                    type: 'video',
                    maxResults: DEFAULT_LIMIT,
                    part: parts.join(','),
                    fields: fields.join(','),
                    id: ids.join(',')
                };

                $http({
                    url: 'https://www.googleapis.com/youtube/v3/videos',
                    method: 'GET',
                    params: secondRequestParams,
                    transformResponse: appendTransform($http.defaults.transformResponse, function(result) {
                        if (!result || !result.items) return [];
                        return TrackAdapter.adaptMultiple(result.items, 'yt');
                    })
                }).success(function(data) {
                    defer.resolve(data);
                }).error(function() {
                    defer.reject();
                });

            }).error(function() {
                defer.reject();
            });

            return defer.promise;
        }
    };

}());
