(function() {

    'use strict';

    angular.module('soundcloudify.background')
        .service('ContextMenuService', ContextMenuService);

    function ContextMenuService ($rootScope, $http, $q, CorePlayer, PlaylistService, TrackAdapter, StorageService, SearchService, API_ENDPOINT, CLIENT_ID, YOUTUBE_KEY){

        var backgroundPage;
        var targetUrlPatterns;
        var playlistItemIds;
        var playlistRootId;

        return {
            init: init,
            updateMenuPlaylists: updateMenuPlaylists,
            playTrack: playTrack,
            playTrackNext: playTrackNext,
            queueTrack: queueTrack,
            addLinkToPlaylist: addLinkToPlaylist,
            resolveTrack: resolveTrack,
            getParameterByName, getParameterByName,
        }

        function init(){
            chrome.contextMenus.removeAll();
            backgroundPage = chrome.extension.getBackgroundPage();

            targetUrlPatterns = [
                'https://soundcloud.com/*/*',
                'http://www.youtube.com/watch?v=*',
                'https://www.youtube.com/watch?v=*',
                'http://youtube.com/watch?v=*',
                'https://youtube.com/watch?v=*'
            ];

            //===========================
            //CONTEXT MENU
            //===========================
            // - UpNext
            //   - Play (will play the song)
            //   - UpNext (will queue the song)
            //   - Add to playlist
            //       - playlist1
            //       - playlist2
            //       - etc...

            chrome.contextMenus.create({
                'type': 'normal',
                'title': 'Play',
                'contexts': ['link'],
                'targetUrlPatterns': targetUrlPatterns,
                'onclick': playTrack
            });

            chrome.contextMenus.create({
                'type': 'normal',
                'title': 'UpNext',
                'contexts': ['link'],
                'targetUrlPatterns': targetUrlPatterns,
                'onclick': playTrackNext
            });

            playlistRootId = chrome.contextMenus.create({
                'type': 'normal',
                'title': 'Add To Playlist',
                'contexts': ['link'],
                'targetUrlPatterns': targetUrlPatterns
            });

            playlistItemIds = [];
            $rootScope.contextPlaylists = PlaylistService.getList();
            updateMenuPlaylists();

            //Watch for changes to playlists
            $rootScope.$watch('contextPlaylists', updateMenuPlaylists, true);
        };

        function updateMenuPlaylists()
        {
            var playlists = $rootScope.contextPlaylists;
            playlistItemIds.forEach(function(id) {
                chrome.contextMenus.remove(id, function(){
                    //ignore
                })
            })

            playlistItemIds = [];

            for(var i = 0; i < playlists.items.length; i++)
            {
                var id = chrome.contextMenus.create({
                    'id': "playlistitem_"+i,
                    'type': 'normal',
                    'parentId': playlistRootId,
                    'title': playlists.items[i].name,
                    'contexts': ['link'],
                    'targetUrlPatterns': targetUrlPatterns,
                    'onclick': addLinkToPlaylist
                });
                playlistItemIds.push(id);
            }
        };

        function playTrack(info, tab)
        {
            resolveTrack(info.linkUrl).then(
                function (track){
                    queueTrack(track, true);  
                }
            )
             
        };

        function playTrackNext(info, tab)
        {
            queueTrack(resolveTrack(info.linkUrl), false);
        };

        function queueTrack(track, playNow)
        {
            if(playNow){
                CorePlayer.add(track, true);
            }
            else{
                CorePlayer.playNext(track);
            }
        }

        function addLinkToPlaylist(info, tab)
        {
            resolveTrack(info.linkUrl).then(function(track){
                var index = parseInt(info.menuItemId.split("_")[1]);
                PlaylistService.addTrackToPlaylist(track, index); 
            });
        };

        function resolveTrack(linkUrl, isYoutube)
        {
            var defer = $q.defer();
            if(linkUrl.includes('youtube'))
            {
                var videoId = getParameterByName(linkUrl, "v");
                SearchService.searchYoutube(videoId, {limit: 1, nextPageToken: ''}).then(function (result){
                    console.log(result.tracks[0]);
                    defer.resolve(result.tracks[0]);
                });
            }
            else
            {
                var url = 'https://api.soundcloud.com/resolve?url='+linkUrl;
                $http({
                    url: url,
                    method: 'GET',
                    params: {client_id: CLIENT_ID}
                }).success(function (data) {
                    defer.resolve(TrackAdapter.adapt(data, 'sc'));              
                });
            }
            return defer.promise;
        };

        function getParameterByName(url,name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(url);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    };
})();
