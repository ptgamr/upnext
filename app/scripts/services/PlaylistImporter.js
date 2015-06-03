(function(angular){
    'use strict';

    angular.module('soundCloudify')
        .service('PlaylistImporter', PlaylistImporter);

    function PlaylistImporter($rootScope, $log, $q, $http, YOUTUBE_KEY, CLIENT_ID, TrackAdapter){

        return {
            fetchPlaylist: fetchPlaylist,
            fetchPlaylistItems: fetchPlaylistItems,
            extractPlaylistId: extractPlaylistId,
            resolveSoundCloudPlaylist: resolveSoundCloudPlaylist
        };

        function extractPlaylistId(playlistUrl) {
            if (!playlistUrl) {
                $log.error('playlist url is missing');
                return;
            };

            var regExp = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
            var match = playlistUrl.match(regExp);
            if (match && match[2]){
                return match[2];
            }
            return null;
        }

        function fetchPlaylist(playlistId) {

            return $q(function(resolve, reject) {

                if (!playlistId) {
                    $log.error('can not extract playlistId from the input');
                    reject();
                }

                //fetch playlist info
                var params = {
                    key: YOUTUBE_KEY,
                    part: 'id,snippet',
                    fields: 'items/id, items/snippet/title',
                    id: playlistId
                };

                $http({
                    url: 'https://www.googleapis.com/youtube/v3/playlists',
                    method: 'GET',
                    params: params,
                }).success(function(result) {

                    if (!result || !result.items || !result.items.length) {
                        reject();
                        return;
                    };

                    var playlistName = result.items[0].snippet.title,
                        resolvedPlaylistId = result.items[0].id;

                    resolve({
                        id: resolvedPlaylistId,
                        name: playlistName
                    });
                    
                }).error(function() {
                    reject();
                });
            });


        }

        function fetchPlaylistItems(playlistId, nextPageToken, allItems) {
            
            return $q(function(resolve, reject) {
                var parts = ['id', 'snippet'];
                var fields = [
                    'nextPageToken',
                    'items/snippet/title',
                    'items/snippet/thumbnails',
                    'items/snippet/resourceId'
                ];

                var playlistItemsRequestParams = {
                    key: YOUTUBE_KEY,
                    maxResults: 50,
                    part: parts.join(','),
                    fields: fields.join(','),
                    playlistId: playlistId,
                    pageToken: nextPageToken || ''
                };

                $http({
                    url: 'https://www.googleapis.com/youtube/v3/playlistItems',
                    method: 'GET',
                    params: playlistItemsRequestParams,
                }).success(function(result) {

                    if (!result || !result.items || !result.items.length) {
                        resolve([]);
                    }

                    var playlistItems = [];

                    _.each(result.items, function(item) {

                        //some videos are removed. They don't get the title in the snippet
                        if (item.snippet && item.snippet.title && item.snippet.resourceId.videoId) {
                            playlistItems.push({
                                id: item.snippet.resourceId.videoId,
                                snippet: {
                                    title: item.snippet.title,
                                    thumbnails: item.snippet.thumbnails,
                                }
                            });
                        }
                    });

                    resolve({
                        items: TrackAdapter.adaptMultiple(playlistItems, 'yt'),
                        nextPageToken: result.nextPageToken
                    });

                }).error(function() {
                    reject();
                });
            }).then(function(data) {
                
                allItems = (allItems || []).concat(data.items);

                if (data.nextPageToken) {
                    return fetchPlaylistItems(playlistId, data.nextPageToken, allItems);
                }

                return allItems;
            });
        }

        function resolveSoundCloudPlaylist(playlistUrl) {

            return $q(function(resolve, reject) {

                var params = {
                    url: playlistUrl,
                    client_id: CLIENT_ID
                };

                $http({
                    url: 'http://api.soundcloud.com/resolve.json',
                    method: 'GET',
                    params: params,
                    transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                        if (!result || !result.tracks) return [];
                        return {
                            name: result.title,
                            tracks: TrackAdapter.adaptMultiple(result.tracks, 'sc')
                        };
                    })
                }).success(function(data) {
                    resolve(data);
                }).error(function() {
                    reject();
                });
            })

        }
    };
}(angular));
