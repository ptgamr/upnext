(function() {

    angular.module('soundcloudify.background')
        .controller('ContextMenuController', ContextMenuController);

    function ContextMenuController ($scope, $rootScope, $http, $q, CorePlayer, PlaylistService, TrackAdapter, StorageService, SearchService, API_ENDPOINT, CLIENT_ID, YOUTUBE_KEY){

        var cm = this;

        cm.init = function(){
            chrome.contextMenus.removeAll();
            $scope.backgroundPage = chrome.extension.getBackgroundPage();

            $scope.targetUrlPatterns = [
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
                'targetUrlPatterns': $scope.targetUrlPatterns,
                'onclick': cm.playTrack
            });

            chrome.contextMenus.create({
                'type': 'normal',
                'title': 'UpNext',
                'contexts': ['link'],
                'targetUrlPatterns': $scope.targetUrlPatterns,
                'onclick': cm.playTrackNext
            });

            $scope.playlistRootId = chrome.contextMenus.create({
                'type': 'normal',
                'title': 'Add To Playlist',
                'contexts': ['link'],
                'targetUrlPatterns': $scope.targetUrlPatterns
            });

            $scope.playlistItemIds = [];
            $scope.contextPlaylists = PlaylistService.getList();
            cm.updateMenuPlaylists();

            $scope.$watch('contextPlaylists', cm.updateMenuPlaylists, true);
        };

        cm.updateMenuPlaylists = function()
        {
            console.log("HERE");
            console.log(JSON.stringify($scope.contextPlaylists));
            playlists = $scope.contextPlaylists;
            $scope.playlistItemIds.forEach(function(id) {
                chrome.contextMenus.remove(id, function(){
                    //ignore
                })
            })

            $scope.playlistItemIds = [];

            for(var i = 0; i < playlists.items.length; i++)
            {
                console.log("adding a menu item");
                var id = chrome.contextMenus.create({
                    'id': "playlistitem_"+i,
                    'type': 'normal',
                    'parentId': $scope.playlistRootId,
                    'title': playlists.items[i].name,
                    'contexts': ['link'],
                    'targetUrlPatterns': $scope.targetUrlPatterns,
                    'onclick': cm.addLinkToPlaylist
                });
                $scope.playlistItemIds.push(id);
            }
        };

        cm.playTrack = function(info, tab)
        {
            cm.queueTrack(cm.resolveTrack(info.linkUrl), true);   
        };

        cm.playTrackNext = function(info, tab)
        {
            cm.queueTrack(cm.resolveTrack(info.linkUrl), false);
        };

        cm.queueTrack = function (track, playNow)
        {
            if(playNow){
                CorePlayer.add(track, true);
            }
            else{
                CorePlayer.playNext(track);
            }
        }

        cm.addLinkToPlaylist = function(info, tab)
        {
            cm.resolveTrack(info.linkUrl).then(function(track){
                console.log(JSON.stringify(track));
                var index = parseInt(info.menuItemId.split("_")[1]);
                PlaylistService.addTrackToPlaylist(track, index); 
            });
        };

        cm.resolveTrack = function(linkUrl, isYoutube)
        {
            var defer = $q.defer();
            if(linkUrl.includes('youtube'))
            {
                videoId = getParameterByName(linkUrl, "v");
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
        PlaylistService.init();
        cm.init();
    };
})();
