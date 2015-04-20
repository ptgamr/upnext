(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SyncService", SyncService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';
    var PLAYLIST_STORAGE_KEY = 'playlist';
    var NOW_PLAYING_LIST_KEY = 'nowPlaying';

    function SyncService($rootScope, $q, $http, API_ENDPOINT){

        var user;
        var lastSynced = localStorage.getItem('lastSynced');

        $rootScope.$on('identity.confirm', function(data) {
            if (data.identity.id) {
                user = data.identity;
                sync();
            }
        });
            
        return {
            sync: sync
        };

        /**
         * after noticed user has logined in to Chrome, sync funciton will do the following things:
         * 1. request for the most updated `lastUpdated`
         * 
         * [lastUpdated === undefined]
         * 2. get all data from server by userId
         * 3. update the local db with the data comming from server (if existed)
         * 4. upload local db to server
         *
         * [lastUpdated !== undefined]
         * 2. query server for all changes from that lastUpdated
         * 3. apply the changes
         * 4. upload local db to server
         * 
         * @return {[type]} [description]
         */
        function sync() {

            if (!lastSynced) {
                //all data
                $http.get(API_ENDPOINT + '/data').success(function(data) {
                    console.log(data);
                });
            }

        }

        function applyChanges(serverData) {

            serverData.playlists = serverData.playlists || [];
            serverData.nowplaying = serverData.nowplaying || [];
            serverData.activities = serverData.activities || [];

            var localPlaylists, localNowPlaying, newPlaylistQueue = [];

            chrome.storage.local.get(null, function(data) {
                localPlaylists = data[PLAYLIST_STORAGE_KEY] || [];
                localNowPlaying = data[NOW_PLAYING_LIST_KEY] || [];

                for (var i = 0 ; i < serverData.playlists.length; i++) {

                    var playlistLocal = findPlaylistById(localPlaylists, serverData.playlists[i].id);

                    //if the playlist is found on local, mean that playlist is being updated somewhere
                    //we then override the local playlist
                    if (playlistLocal) {
                        playlistLocal = serverData.playlists[i];

                    //otherwise, the playlist is newly created
                    //put it in the queue, waiting to be pushed
                    } else {
                        newPlaylistQueue.push(serverData.playlists[i]);
                    }
                }

                if (newPlaylistQueue.length) {
                    localPlaylists = newPlaylistQueue.concat(localPlaylists);
                }

                //finished server -> local
                //now local -> server
                
                var unsyncedPlaylists = _.filter(playlists, function(item) {
                    return item.origin === ORIGIN_LOCAL;
                });

                uploadLocalDataToServer(unsyncedPlaylists);
            });
        }

        function uploadLocalDataToServer(unsyncedPlaylists) {

            var promises = [];

            if (unsyncedPlaylists.length) {
                for (var i = 0 ; i < unsyncedPlaylists.length; i++) {
                    promises.push(
                        $http({
                            url: API_ENDPOINT + '/playlist',
                            method: 'POST',
                            data: playlist,
                        })
                    );
                }
            }

            $q.all(promises).then(function(data) {
                
            });
        }

        function findPlaylistById(playlists, id) {
            return _.findWhere(playlists, {id: id});
        }
    };

}());
