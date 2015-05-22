(function(angular){
    'use strict';

    angular.module('soundCloudify')
        .service('PlaylistImporter', PlaylistImporter);

    function PlaylistImporter($rootScope, $log, $q, $http, YOUTUBE_KEY, TrackAdapter){

        return {
            fetchPlaylist: fetchPlaylist,
            fetchPlaylistItems: fetchPlaylistItems,
            extractPlaylistId: extractPlaylistId
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
                        resolve();
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

        function fetchPlaylistItems(playlistId) {
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
                    playlistId: playlistId
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

                    resolve(TrackAdapter.adaptMultiple(playlistItems, 'yt'));

                }).error(function() {
                    reject();
                });
            });
        }
    };
}(angular));
