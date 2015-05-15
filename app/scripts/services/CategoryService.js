(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Category", CategoryService);

    function CategoryService($http, $q, CLIENT_ID, TrackAdapter, API_ENDPOINT){

        var cachedCategory = JSON.parse(localStorage.getItem('charts')) || [];
        var cachedRedditVideoIds = [];
        
        return {
            getList: getList,
            getTracks: getTracks,
            getRedditHot: getRedditHot
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

        function getRedditHot(pagingObject) {
            return $q(function(resolve, reject) {

                if (!cachedRedditVideoIds.length) {

                    $http({
                        url: API_ENDPOINT + '/reddit',
                        method: 'GET'
                    }).success(function(videoIds) {

                        cachedRedditVideoIds = videoIds;

                        var pagingVideoIds = angular.copy(cachedRedditVideoIds).splice(pagingObject.skip, pagingObject.limit);
                        getVideosInfo(pagingVideoIds, resolve, reject);

                    }).error(function() {
                        reject();
                    })
                } else {

                    var pagingVideoIds = angular.copy(cachedRedditVideoIds).splice(pagingObject.skip, pagingObject.limit);
                    getVideosInfo(pagingVideoIds, resolve, reject);

                }

            });
        }

        function getVideosInfo(ids, resolve, reject) {

            var parts = ['id', 'snippet', 'statistics', 'status'];
            var fields = [
                'items/id',
                'items/snippet/title',
                'items/snippet/thumbnails',
                'items/statistics/viewCount',
                'items/statistics/likeCount',
                'items/status/embeddable'
            ];

            var requestParam = {
                key: 'AIzaSyDGbUJxAkFnaJqlTD4NwDmzWxXAk55gFh4',
                type: 'video',
                maxResults: ids.length,
                part: parts.join(','),
                fields: fields.join(','),
                id: ids.join(',')
            };

            $http({
                url: 'https://www.googleapis.com/youtube/v3/videos',
                method: 'GET',
                params: requestParam,
                transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                    if (!result || !result.items) return [];
                    return {
                        tracks: TrackAdapter.adaptMultiple(result.items, 'yt')
                    }
                })
            }).success(function(data) {
                resolve(data);
            }).error(function() {
                reject();
            });

        }
    };

}());
