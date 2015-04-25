(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("NowPlaying", NowPlayingService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';

    function NowPlayingService($http, $q, CLIENT_ID, $rootScope, API_ENDPOINT, SyncService, $indexedDB){

        var NOW_PLAYING_LIST_KEY = 'nowPlaying';
        var NOW_PLAYING_STATE_KEY = 'nowPlayingState';
        var onNowPlayingChange = null, onNowPlayingStateChange = null;
        var user;
        var backgroundPage = chrome.extension.getBackgroundPage();

        //local cache, used by CorePlayer, and is watched by AngularJS for changes
        var nowplaying = {
            tracks: [],
            trackIds: []
        };
        var state = backgroundPage.mainPlayer.state;

        //Storage API for simplify IndexedDB interaction
        var Storage = {
            upsert: function (tracks) {
                $indexedDB.openStore('nowplaying', function(store) {
                    _.each(tracks, function(track) {
                        store.upsert(track);
                    });
                });
            },
            insert: function (tracks) {
                $indexedDB.openStore('nowplaying', function(store) {
                    if (Array.isArray(tracks)) {
                        _.each(tracks, function(track) {
                            store.insert(track);
                        });
                    } else {
                        store.insert(tracks);
                    }
                });
            },
            delete: function(trackIds) {
                $indexedDB.openStore('nowplaying', function(store) {
                    if (Array.isArray(trackIds)) {
                        _.each(trackIds, function(trackId) {
                            store.delete(trackId);
                        });
                    } else {
                        store.delete(trackIds);
                    }
                });
            },
            getTracks: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('nowplaying', function(store) {
                        store.getAll().then(function(tracks) {  
                            resolve(_.sortBy(tracks, 'order').reverse());
                        });
                    });
                });
            }
        };

        $rootScope.$on('identity.confirm', function(event, data) {
            if (data.identity.id && data.identity.email) {
                user = data.identity;
            }
        });

        $rootScope.$on('sync.completed', function() {
            getFromStorage();
        });

        getFromStorage();

        return {
            getList: getList,
            addTrack: addTrack,
            addTracks: addTracks,
            removeTrack: removeTrack,
            removeAllTracks: removeAllTracks,
            getState: getState,
            saveState: saveState
        };

        function getFromStorage() {

            Storage.getTracks()
                    .then(function(tracks) {
                        nowplaying.tracks = tracks || [];
                        nowplaying.trackIds = _.map(tracks, function(track) { return track.uuid; });
                        backgroundPage.mainPlayer.saveTrackIds(nowplaying.trackIds);
                    })
        };

        function getList(callback){
            return nowplaying;
        }

        function addTrack(track, position) {

            //we need to do a copy here to ensure each track we add
            //to the playlist will have a unique id
            track = angular.copy(track);
            track.uuid = window.ServiceHelpers.ID();
            track.sync = 0;

            if (position) {
                track.order = position;
                nowplaying.tracks.splice(position, 0, track);
                nowplaying.trackIds.splice(position, 0, track.uuid);

                var tobeUpsert = [track];

                _.each(nowplaying.tracks, function(track) {
                    if (track.order > position) {
                        track.order += 1;
                        tobeUpsert.push(track);
                    }
                });

                if (tobeUpsert.length) {
                    Storage.upsert(tobeUpsert);
                }

            } else {
                track.order = nowplaying.tracks.length ? nowplaying.tracks[0].order + 1 : 0;
                nowplaying.tracks.unshift(track);
                nowplaying.trackIds.unshift(track.uuid);
                Storage.insert(track);
            }

            backgroundPage.mainPlayer.saveTrackIds(nowplaying.trackIds);

            return $q(function(resolve, reject) {

                if (user) {

                    $http({
                        url: API_ENDPOINT + '/nowplaying',
                        method: 'PUT',
                        data: {
                            added: track
                        }
                    }).success(function(response) {

                        track.internalId = response.internalId;
                        track.sync = 1;

                        Storage.upsert(track);

                        SyncService.bumpLastSynced();

                        resolve();

                    }).error(function() {
                        console.log('error POST a playlist');
                        reject();
                    });

                } else {
                    resolve();
                }

            });
        }

        function addTracks(tracks) {

            return $q(function(resolve, reject) {

                removeAllTracks().then(function() {

                    var tracksToAdd = _.map(tracks, function(track) {
                        track = angular.copy(track);
                        track.uuid = window.ServiceHelpers.ID();
                        track.sync = 0;
                        return track;
                    });

                    nowplaying.tracks = tracksToAdd;
                    nowplaying.trackIds = _.map(nowplaying.tracks, function(track) {
                        return track.uuid;
                    });

                    backgroundPage.mainPlayer.saveTrackIds(nowplaying.trackIds);

                    Storage.insert(tracksToAdd);

                    if (user) {

                        $http({
                            url: API_ENDPOINT + '/nowplaying',
                            method: 'PUT',
                            data: {
                                added: tracksToAdd
                            }
                        }).success(function(response) {

                            _.each(response, function(info, index) {
                                tracksToAdd[index].internalId = info.internalId;
                                tracksToAdd[index].sync = 1;
                            });

                            Storage.upsert(tracksToAdd);

                            SyncService.bumpLastSynced();
                            resolve();
                        }).error(function() {
                            console.log('error adding multiple tracks to NowPlaying list');
                            reject();
                        });


                    } else {
                        resolve();
                    }

                });

            });

        }

        function removeTrack(position) {
            return $q(function(resolve, reject) {
                
                var track = nowplaying.tracks[position];
                
                if (!track) reject();

                if (track) {
                    Storage.delete(track.uuid);
                    nowplaying.tracks.splice(position, 1);
                    nowplaying.trackIds.splice(position, 1);
                }

                backgroundPage.mainPlayer.saveTrackIds(nowplaying.trackIds);

                var internalId = track.internalId;

                if (user && internalId) {
                    $http({
                        url: API_ENDPOINT + '/nowplaying',
                        method: 'PUT',
                        data: {
                            removed: internalId
                        }
                    }).success(function(response) {
                        SyncService.bumpLastSynced();
                        resolve();
                    }).error(function() {
                        reject();
                    });
                } else {
                    resolve();
                }
            });
        }

        function removeAllTracks() {

            return $q(function(resolve, reject) {

                var internalIds = _.map(nowplaying.tracks, function(track) {
                    return track.internalId;
                });

                var uuids = nowplaying.trackIds;
                Storage.delete(uuids);

                nowplaying.tracks = [];
                nowplaying.trackIds = [];
                backgroundPage.mainPlayer.saveTrackIds([]);

                if (user) {

                    if (internalIds.length) {
                        $http({
                            url: API_ENDPOINT + '/nowplaying',
                            method: 'PUT',
                            data: {
                                removed: internalIds
                            }
                        }).success(function(response) {

                            SyncService.bumpLastSynced();
                            resolve();

                        }).error(function() {
                            console.log('error remove multiple tracks from nowPlaying list');
                            reject();
                        });
                    } else {
                        resolve();
                    }

                } else {
                    resolve();
                }

            });
        }

        function saveState(newState) {
            state = newState;
            backgroundPage.mainPlayer.saveState(newState);
        }

        function getState(callback) {
            return state;
        }
    };

}());
