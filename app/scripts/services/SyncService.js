(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SyncService", SyncService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';
    var PLAYLIST_STORAGE_KEY = 'playlist';
    var NOW_PLAYING_LIST_KEY = 'nowPlaying';

    function SyncService($rootScope, $q, $http, $timeout, API_ENDPOINT){

        var user;
        var lastSynced = localStorage.getItem('lastSynced');

        return {
            init: init,
            sync: sync
        };

        function init() {
            $rootScope.$on('identity.confirm', function(event, data) {
                if (data.identity.id) {
                    user = data.identity;
                    console.log('let sync!');

                    //start sync after 1s
                    $timeout(function() {
                        sync();
                    }, 1000);
                }
            });
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

            var dataURL = API_ENDPOINT + '/data';

            if (lastSynced) {
                dataURL += '?from=' + lastSynced;
            }

            //fetch the changes
            $http.get(dataURL).success(function(serverData) {
                pipeWithLocalData(serverData)
                    .then(applyChanges)
                    .then(uploadLocalDataToServer);
            });

        }

        function pipeWithLocalData(serverData) {
            return $q(function(resolve, reject) {
                chrome.storage.local.get(null, function(localData) {
                    resolve({
                        localData: localData,
                        serverData: serverData
                    });
                });
            });
        };

        function applyChanges(dataStream) {

            var defer = $q.defer();

            var localData = dataStream.localData,
                serverData = dataStream.serverData,
                localPlaylists = localData[PLAYLIST_STORAGE_KEY] || [],
                localNowPlaying = localData[NOW_PLAYING_LIST_KEY] || [],
                newPlaylistQueue = [];

            $timeout(function() {

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

                //save changes
                localData[PLAYLIST_STORAGE_KEY] = localPlaylists;

                defer.resolve(localData);
            });

            
            return defer.promise;
        }

        //now local -> server
        function uploadLocalDataToServer(localData) {

            var playlists = localData[PLAYLIST_STORAGE_KEY] || [];
            
            var unsyncedPlaylists = _.filter(playlists, function(item) {
                return item.origin === ORIGIN_LOCAL;
            });

            var promises = [];

            if (unsyncedPlaylists.length) {
                for (var i = 0 ; i < unsyncedPlaylists.length; i++) {
                    promises.push(
                        $http({
                            url: API_ENDPOINT + '/playlist',
                            method: 'POST',
                            data: unsyncedPlaylists[i],
                        })
                    );
                }
            }

            $q.all(promises).then(function(data) {
                console.log('all done');
            });
        }

        function findPlaylistById(playlists, id) {
            return _.findWhere(playlists, {id: id});
        }
    };

}());
