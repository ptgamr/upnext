(function(){
    'use strict';

    angular.module('soundCloudify')
         .service("StorageService", StorageService);


    function StorageService($q, $indexedDB) {

        function PlaylistStorage() {

        }

        PlaylistStorage.prototype = {
            constructor: PlaylistStorage,
            getById: function(uuid) {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('playlist', function(store) {
                        store.find(uuid).then(function(playlist) {
                            resolve(playlist);
                        }, function() {
                            reject();
                        });
                    });
                });
            },
            upsert: function (playlist) {
                $indexedDB.openStore('playlist', function(store) {
                    store.upsert(playlist);
                });
            },
            insert: function (playlist) {
                $indexedDB.openStore('playlist', function(store) {
                    store.insert(playlist);
                });
            },
            delete: function(playlistIds) {
                $indexedDB.openStore('playlist', function(store) {
                    if (Array.isArray(playlistIds)) {
                        _.each(playlistIds, function(playlistId) {
                            store.delete(playlistId);
                        });
                    } else {
                        store.delete(playlistIds);
                    }
                });
            },
            getAllPlaylists: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('playlist', function(store) {
                        var query = store.query();
                        query.$index('deleted');
                        query.$eq(0);
                        store.eachWhere(query).then(function(playlist) {
                            resolve(_.sortBy(playlist, 'order').reverse());
                        });
                    });
                });
            },
            getUnsyncedPlaylists: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('playlist', function(store) {
                        store.getAll().then(function(playlists) {
                            resolve(playlists);
                        });
                    });
                });
            }
        };

        function NowplayingStorage() {

        }

        NowplayingStorage.prototype = {
            constructor: NowplayingStorage,
            upsert: function (tracks) {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('nowplaying', function(store) {
                        _.each(tracks, function(track) {
                            store.upsert(track);
                        });
                        resolve();
                    });
                });
            },
            insert: function (tracks) {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('nowplaying', function(store) {
                        if (Array.isArray(tracks)) {
                            _.each(tracks, function(track) {
                                store.insert(track);
                            });
                            resolve();
                        } else {
                            store.insert(tracks);
                            resolve();
                        }
                    });
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
            clear: function() {
                $indexedDB.openStore('nowplaying', function(store) {
                    store.clear();
                });
            },
            getTracks: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('nowplaying', function(store) {
                        var query = store.query();
                        query.$index('deleted');
                        query.$eq(0);
                        store.eachWhere(query).then(function(tracks) {
                            resolve(_.sortBy(tracks, 'order').reverse());
                        });
                    });
                });
            },
            getById: function(trackId) {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('nowplaying', function(store) {
                        store.find(trackId).then(function(track) {
                            resolve(track);
                        });
                    });
                });
            },
            increaseOrder: function(trackIds) {
                var self = this;
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('nowplaying', function(store) {
                        _.each(trackIds, function(trackId) {
                            store.find(trackId).then(function(track) {
                                track.order += 1;
                                store.upsert(track);
                            });
                        });
                        resolve();
                    });
                });
            },
            getUnsyncedTracks: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('nowplaying', function(store) {
                        var query = store.query();
                        query.$index('sync');
                        query.$eq(0);
                        store.eachWhere(query).then(function(tracks) {
                            resolve(tracks);
                        });
                    });
                });
            }
        };

        function StarredStorage() {

        }

        StarredStorage.prototype = {
            constructor: StarredStorage,
            insert: function (tracks) {
                $indexedDB.openStore('starred', function(store) {
                    if (Array.isArray(tracks)) {
                        _.each(tracks, function(track) {
                            store.insert(track);
                        });
                    } else {
                        store.insert(tracks);
                    }
                });
            },
            upsert: function (tracks) {
                $indexedDB.openStore('starred', function(store) {
                    if (Array.isArray(tracks)) {
                        _.each(tracks, function(track) {
                            store.upsert(track);
                        });
                    } else {
                        store.upsert(tracks);
                    }
                });
            },
            delete: function(trackIds) {
                $indexedDB.openStore('starred', function(store) {
                    if (Array.isArray(trackIds)) {
                        _.each(trackIds, function(trackId) {
                            store.delete(trackId);
                        });
                    } else {
                        store.delete(trackIds);
                    }
                });
            },
            getById: function(trackId) {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('starred', function(store) {
                        store.find(trackId).then(function(track) {
                            resolve(track);
                        });
                    });
                });
            },
            getTracks: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('starred', function(store) {
                        var query = store.query();
                        query.$index('deleted');
                        query.$eq(0);
                        store.eachWhere(query).then(function(tracks) {
                            resolve(_.sortBy(tracks, 'order').reverse());
                        });
                    });
                });
            },
            getUnsyncedTracks: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('starred', function(store) {
                        var query = store.query();
                        query.$index('sync');
                        query.$eq(0);
                        store.eachWhere(query).then(function(tracks) {
                            resolve(tracks);
                        });
                    });
                });
            }
        };

        return {
            getStorageInstance: getStorageInstance
        }

        function getStorageInstance(storage) {
            switch(storage) {
                case 'playlist':
                    return new PlaylistStorage();
                case 'nowplaying':
                    return new NowplayingStorage();
                case 'starred':
                    return new StarredStorage();
            }
            return null;
        }
    }

}());
