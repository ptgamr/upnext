(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SyncService", SyncService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';
    var PLAYLIST_STORAGE_KEY = 'playlist';
    var NOW_PLAYING_LIST_KEY = 'nowPlaying';

    function SyncService($rootScope, $log, $q, $http, $timeout, API_ENDPOINT, StorageService){

        var user;
        var lastSynced = localStorage.getItem('lastSynced');

        var PlaylistStorage = StorageService.getStorageInstance('playlist');
        var StarredStorage = StorageService.getStorageInstance('starred');

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
                    $log.debug('let sync!');

                    //start sync after 1s
                    $timeout(function() {
                        sync();
                    }, 1000);
                }
            });
        };

        function sync() {

            $rootScope.$broadcast('sync.start');
            $rootScope.syncing = true;

            pull().then(push).then(bumpLastSynced);
        }

        function pull() {

            if (pulling) {
                $log.debug('SyncService::pull() is in progress');
                reject();
                return;
            }

            if (!user) {
                $log.debug('SyncService::pull() no user');
                reject();
                return;
            }

            $log.debug('SyncService::pull()');

            pulling = true;

            return $q(function(resolve, reject) {

                var dataURL = API_ENDPOINT + '/data';

                if (lastSynced) {
                    dataURL += '?from=' + lastSynced;
                }

                //fetch the changes
                $http.get(dataURL).success(function(serverData) {

                    _.each(serverData.playlists, function(serverPlaylist, index) {

                        if (serverPlaylist.deleted) {

                            PlaylistStorage.delete(serverPlaylist.uuid);

                        } else {


                            /**
                             * merge the server changes with the local ones
                             * if there is any local, this is a large chance that user logout, then use the app, then login again
                             * for eg:
                             * server: [1,2,3,4,5]
                             * local: [1,2,3,4*,5,6,7*,8*,9*] (* the local one)
                             * result: [1,2,3,4,5,6*,7*,8*,9*] (* the local which order has been modified)
                            */
                            if (!serverPlaylist.uuid) {
                                serverPlaylist.uuid = window.ServiceHelpers.ID();
                            }

                            serverPlaylist.sync = 1;

                            _.each(serverPlaylist.tracks, function(track) {
                                track.sync = 1;
                            });

                            PlaylistStorage.getById(serverPlaylist.uuid)
                                .then(function(localPlaylist) {
                                    //tracks have not been stored to server
                                    var localTracks = _.filter(localPlaylist.tracks, function(track) {
                                        return !track.internalId;
                                    });


                                    if (localTracks.length) {
                                        //modiy order
                                        var maxOrder = serverPlaylist.tracks.length ? serverPlaylist.tracks[serverPlaylist.tracks.length - 1].order : 0;
                                        _.each(localTracks, function(track, index) {
                                            track.order = maxOrder + index + 1;
                                        });
                                        localPlaylist = serverPlaylist;
                                        //mark the playlist as unsync
                                        localPlaylist.sync = 0;
                                        localPlaylist.tracks = localPlaylist.tracks.concat(localTracks);
                                        PlaylistStorage.upsert(localPlaylist);
                                    } else {
                                        PlaylistStorage.upsert(serverPlaylist);
                                    }
                                }, function() {
                                    PlaylistStorage.insert(serverPlaylist);
                                });
                        }

                    });

                    /**
                     * got a list of of changes to "Star" list, either
                     * - a new track has been starred
                     * - a track has been unstarred (mark by deleted field)
                     * what we do:
                     * - update the added one to local db
                     * - remove the deleted one from local db
                     */
                    if (serverData.starred.tracks && serverData.starred.tracks.length) {

                        var toBeUpsert = [],
                            toBeDeleted = [];
                        _.each(serverData.starred.tracks, function(track) {
                            if (!track.deleted) {
                                track.sync = 1;
                                toBeUpsert.push(track);
                            } else {
                                toBeDeleted.push(track);
                            }
                        });

                        StarredStorage.upsert(toBeUpsert);

                        if (toBeDeleted.length) {
                            StarredStorage.delete(_.map(toBeDeleted, function(removal) { return removal.id; }));
                        }
                    }

                    resolve(serverData.time);

                    pulling = true;
                });

            });

        }

        function push(lastSynced) {

            return $q(function(resolve, reject) {

                if (pushing) {
                    $log.debug('SyncService::push() is in progress');
                    reject();
                    return;
                }

                if (!user) {
                    $log.debug('SyncService::push() no user');
                    reject();
                    return;
                }

                $log.debug('SyncService::push()');

                pushing = true;

                $q.all({
                        unsyncedPlaylists: PlaylistStorage.getUnsyncedPlaylists(),
                        unsyncedStarredTracks: StarredStorage.getUnsyncedTracks()
                    })
                    .then(function(result) {

                        /**
                         * Detecting changes
                         */
                        var localPlaylists = result.unsyncedPlaylists;
                        var localStarredTracks = result.unsyncedStarredTracks;

                        var promises = [];

                        //=========================================
                        //Playlist
                        //=========================================
                        _.each(localPlaylists, function(playlist) {

                            //brand new playlist
                            if (!playlist.id) {
                                promises.push(
                                    $http({
                                        url: API_ENDPOINT + '/playlist',
                                        method: 'POST',
                                        data: playlist,
                                    })
                                );
                            } else {

                                if(!playlist.deleted) { //playlist already stored, but tracks has been added or removed

                                    var tracksToAdd = _.filter(playlist.tracks, function(track) {
                                        return !track.internalId && !track.deleted;
                                    });

                                    var tracksToRemove = _.filter(playlist.tracks, function(track) {
                                        return track.internalId && track.deleted;
                                    });

                                    if (tracksToAdd.length || tracksToRemove.length) {
                                        promises.push(
                                            $http({
                                                url: API_ENDPOINT + '/playlist/' + playlist.id,
                                                method: 'PUT',
                                                data: {
                                                    added: tracksToAdd,
                                                    removed: _.map(tracksToRemove, function(removal) { return removal.internalId; })
                                                }
                                            })
                                        );
                                    }

                                } else {
                                    promises.push(
                                        $http({
                                            url: API_ENDPOINT + '/playlist/' + playlist.id,
                                            method: 'DELETE'
                                        })
                                    );
                                }
                            }


                        });

                        //=========================================
                        //Starred
                        //=========================================
                        var starred = _.filter(localStarredTracks, function(track) {
                            return !track.internalId;
                        });
                        starred = _.sortBy(starred, function(track) {return track.order});

                        var unstarred = _.filter(localStarredTracks, function(track) {
                            return track.internalId && track.deleted === 1;
                        });

                        if (starred.length || unstarred.length) {
                            promises.push(
                                $http({
                                    url: API_ENDPOINT + '/star',
                                    method: 'PUT',
                                    data: {
                                        added : starred,
                                        removed: _.map(unstarred, function(removal) { return removal.internalId; })
                                    }
                                })
                            );
                        } else {
                            promises.push($q(function(resolve, reject){ resolve('star'); }));
                        }

                        $q.all(promises).then(function(responses) {

                            var starredResponse = responses.splice(responses.length - 1, 1)[0];
                            var playlistResponse = responses;

                            //update unsynced tracks
                            _.each(playlistResponse, function(response, index) {

                                var playlist = localPlaylists[index];

                                if (response.data.playlist) {
                                    playlist = response.data.playlist;
                                    playlist.sync = 1;
                                    PlaylistStorage.upsert(playlist);
                                    lastSynced = response.data.time;
                                } else if (playlist && response.data.length){

                                    //update the song that has been stored
                                    _.each(response.data[0], function(serverTrack, index) {
                                        var trackInPlaylist = _.findWhere(playlist.tracks, {uuid: serverTrack.uuid});
                                        if (trackInPlaylist) {
                                            trackInPlaylist.internalId = serverTrack.internalId;
                                        }
                                    });

                                    //remove the song that marked as deleted
                                    //TODO: check if the song is really removed???
                                    playlist.tracks = _.filter(playlist.tracks, function(track) {
                                        return !track.deleted;
                                    });

                                    playlist.sync = 1;
                                    PlaylistStorage.upsert(playlist);
                                    lastSynced = response.data[2].time;
                                } else if (playlist.deleted) {
                                    PlaylistStorage.delete(playlist.uuid);
                                    lastSynced = response.data.time;
                                }

                            });

                            //update star list
                            //TODO: remove the deleted one
                            if (starredResponse && starredResponse.data && starredResponse.data.length) {

                                //data[0]: result of added
                                _.each(starredResponse.data[0], function(internalId, index) {
                                    var track = starred[index];
                                    track.internalId = internalId.internalId;
                                    track.sync = 1;
                                });
                                StarredStorage.upsert(starred);

                                //data[1]: result of removed
                                var unstarredIds = _.map(unstarred, function(removal) { return removal.id; });
                                StarredStorage.delete(unstarredIds);

                                //data[2]: for time
                                lastSynced = starredResponse.data[2].time;
                            }

                            pushing = false;

                            resolve(lastSynced);

                        }, function() {
                            pushing = false;
                            reject();
                        });
                    });
            });

        }

        function bumpLastSynced(lastSynced) {

            if (!lastSynced) return;

            localStorage.setItem('lastSynced', lastSynced);
            $rootScope.$broadcast('sync.completed');
            $rootScope.syncing = false;
        }
    };

}());
