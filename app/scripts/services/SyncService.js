(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SyncService", SyncService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';
    var PLAYLIST_STORAGE_KEY = 'playlist';
    var NOW_PLAYING_LIST_KEY = 'nowPlaying';

    function SyncService($rootScope, $q, $http, $timeout, API_ENDPOINT, StorageService){

        var user;
        var lastSynced = localStorage.getItem('lastSynced');

        var PlaylistStorage = StorageService.getStorageInstance('playlist');
        var NowplayingStorage = StorageService.getStorageInstance('nowplaying');

        var pulling = false;
        var pushing = false;


        return {
            init: init,
            sync: sync,
            pull: pull,
            push: push,
            bumpLastSynced: bumpLastSynced
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

        function sync() {

            $rootScope.$broadcast('sync.start');

            pull().then(push).then(bumpLastSynced);
        }

        function pull() {

            if (pulling) {
                console.log('SyncService::pull() is in progress');
                reject();
                return;
            }

            if (!user) {
                console.log('SyncService::pull() no user');
                reject();
                return;
            }

            console.log('SyncService::pull()');

            pulling = true;

            return $q(function(resolve, reject) {

                var dataURL = API_ENDPOINT + '/data';

                if (lastSynced) {
                    dataURL += '?from=' + lastSynced;
                }

                //fetch the changes
                $http.get(dataURL).success(function(serverData) {
                    _.each(serverData.playlists, function(playlist, index) {

                        if (playlist.deleted) {
                            playlist.sync = 1;
                            PlaylistStorage.delete(playlist.uuid);
                        } else {
                            PlaylistStorage.upsert(playlist);
                        }

                    });

                    /**
                     * if all tracks are deleted -> server will response an empty list
                     * if nothing changes -> server will not response with any list
                     */
                    if (serverData.nowplaying.tracks) {
                        if (serverData.nowplaying.tracks.length === 0) {
                            NowplayingStorage.clear();
                        } else {
                            _.each(serverData.nowplaying.tracks, function(track) {
                                //TODO: check, if we don't handle delete correctly
                                //it might be a waste
                                if (track.deleted) {
                                    NowplayingStorage.delete(track.uuid);
                                } else {
                                    track.sync = 1;
                                    NowplayingStorage.upsert(track);
                                }
                            });
                        }
                    }

                    resolve();

                    pulling = true;
                });
                
            });

        }

        function push() {

            return $q(function(resolve, reject) {

                if (pushing) {
                    console.log('SyncService::push() is in progress');
                    reject();
                    return;
                }

                if (!user) {
                    console.log('SyncService::push() no user');
                    reject();
                    return;
                }

                console.log('SyncService::push()');

                pushing = true;

                $q.all({
                        unsyncedPlaylists: PlaylistStorage.getUnsyncedPlaylists(),
                        unsyncedNowPlayingTracks: NowplayingStorage.getUnsyncedTracks()
                    })
                    .then(function(result) {

                        /**
                         * Detecting changes
                         */
                        var localPlaylists = result.unsyncedPlaylists;
                        var localNowplayingTracks = result.unsyncedNowPlayingTracks;
                        var promises = [];

                        _.each(localPlaylists, function(playlist) {
                            promises.push(
                                $http({
                                    url: API_ENDPOINT + '/playlist',
                                    method: 'POST',
                                    data: playlist,
                                })
                            );
                        });

                        var added = _.filter(localNowplayingTracks, function(track) {
                            return track.deleted === 0;
                        });

                        var removed = _.filter(localNowplayingTracks, function(track) {
                            return track.deleted === 1;
                        });

                        if (added.length) {
                            promises.push(
                                $http({
                                    url: API_ENDPOINT + '/nowplaying',
                                    method: 'PUT',
                                    data: {
                                        added : added
                                    }
                                })
                            );
                        } else {
                            promises.push($q(function(resolve, reject){ resolve('nowplaying'); }));
                        }

                        $q.all(promises).then(function(responses) {

                            var nowplayingResponse = responses.splice(responses.length - 1, 1)[0];
                            var playlistResponse = responses;

                            _.each(playlistResponse, function(response, index) {
                                var playlist = localPlaylists[index];
                                if (playlist) {
                                    playlist.id = response.data.id;
                                    playlist.updated = response.data.updated;
                                    playlist.sync = 1;
                                }

                                PlaylistStorage.upsert(playlist);
                            });

                            if (nowplayingResponse && nowplayingResponse.data && nowplayingResponse.data.length) {
                                _.each(nowplayingResponse.data[0], function(internalId, index) {
                                    var track = added[index];
                                    track.internalId = internalId.internalId;
                                    track.sync = 1;
                                });

                                NowplayingStorage.upsert(added);
                            }

                            pushing = false;

                            resolve();

                        }, function() {
                            pushing = false;
                            reject();
                        });
                    });
            });

        }

        function bumpLastSynced() {
            lastSynced = Date.now();
            localStorage.setItem('lastSynced', lastSynced);
        }
    };

}());
