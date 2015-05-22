(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SearchService", SearchService);

    var DEFAULT_LIMIT = 20;


    function SearchService($http, CLIENT_ID, YOUTUBE_KEY, TrackAdapter, $q){
        
        return {
            search: search,
            searchYoutube: searchYoutube
        };

        function search(term, pagingObject){
            var params = { q: term, limit: pagingObject.limit, offset: pagingObject.skip, linked_partitioning: 1, client_id: CLIENT_ID };

            return $q(function(resolve, reject) {
                $http({
                    url: 'https://api-v2.soundcloud.com/search/tracks',
                    method: 'GET',
                    params: params,
                    transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                        if (!result || !result.collection) return [];
                        return {
                            tracks: TrackAdapter.adaptMultiple(result.collection, 'sc')
                        };
                    })
                }).success(function(data) {
                    resolve(data)
                }).error(function() {
                    reject();
                });
            })
        }

        function searchYoutube(term, pagingObject) {

            var defer = $q.defer();

            var params = {
                key: YOUTUBE_KEY,
                type: 'video',
                maxResults: pagingObject.limit,
                pageToken: pagingObject.nextPageToken,
                part: 'id',
                //fields: 'items/id',
                q: term
            };

            var nextPageToken = '';

            $http({
                url: 'https://www.googleapis.com/youtube/v3/search',
                method: 'GET',
                params: params
            }).success(function(result) {
                if (!result || !result.items) defer.resolve([]);

                nextPageToken = result.nextPageToken;

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
                    key: YOUTUBE_KEY,
                    type: 'video',
                    maxResults: pagingObject.limit,
                    part: parts.join(','),
                    fields: fields.join(','),
                    id: ids.join(',')
                };

                $http({
                    url: 'https://www.googleapis.com/youtube/v3/videos',
                    method: 'GET',
                    params: secondRequestParams,
                    transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                        if (!result || !result.items) return [];
                        return {
                            nextPageToken: nextPageToken,
                            tracks: TrackAdapter.adaptMultiple(result.items, 'yt')
                        }
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
