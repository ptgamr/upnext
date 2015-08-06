(function() {

    console.log("YOOOOOOOOOOOOO");

    angular.module('soundcloudify.contextMenu')
        .controller('ContextMenuController', ContextMenuController);

    console.log("YOOOOOOOOOOOOO");

    function ContextMenuController ($scope, $rootScope, $http, PlaylistService, TrackAdapter, SearchService, API_ENDPOINT, CLIENT_ID, YOUTUBE_KEY){

        var cm = this;

        cm.init = function(){
            chrome.contextMenus.removeAll();
            $scope.backgroundPage = chrome.extension.getBackgroundPage();

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
                'targetUrlPatterns': [
                    'https://soundcloud.com/*/*',
                    'http://www.youtube.com/watch?v=*',
                    'https://www.youtube.com/watch?v=*',
                    'http://youtube.com/watch?v=*',
                    'https://youtube.com/watch?v=*'
                ],
                'onclick': cm.playTrack
            });

            chrome.contextMenus.create({
                'type': 'normal',
                'title': 'UpNext',
                'contexts': ['link'],
                'onclick': function (info, tab) {
                    console.log("contextTrigger");
                }
            });

            $scope.playlistRootId = chrome.contextMenus.create({
                'type': 'normal',
                'title': 'Add To Playlist',
                'contexts': ['link']
            });

            $scope.playlistItemIds = [];
            $scope.contextPlaylists = PlaylistService.getList();

            $scope.$watch('contextPlaylists', cm.updateMenuPlaylists, true);
        };

        cm.updateMenuPlaylists = function()
        {
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
                    'onclick': cm.addLinkToPlaylist
                });
                $scope.playlistItemIds.push(id);
            }
        };

        cm.playTrack = function(info, tab)
        {
            if(info.linkUrl.includes('youtube'))
            {
                videoId = getParameterByName(info.linkUrl, "v");
                SearchService.searchYoutube(videoId, {limit: 1, nextPageToken: ''}).then(function (result){
                    $scope.backgroundPage.mainPlayer.play(result.tracks[0]);
                });
            }
            else
            {
                var url = 'https://api.soundcloud.com/resolve?url='+info.linkUrl;
                $http({
                    url: url,
                    method: 'GET',
                    params: {client_id: CLIENT_ID}
                }).success(function (data) {
                    var track = TrackAdapter.adapt(data, 'sc');
                    $scope.backgroundPage.mainPlayer.play(track);
                });
            }
            
        };

        cm.queueTrack = function(info, tab)
        {

        };

        cm.addLinkToPlaylist = function(info, tab)
        {
            
        };

        function getParameterByName(url,name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(url);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

        console.log("YOOOOOOOOOOOOO");
        cm.init();
    };
})();
