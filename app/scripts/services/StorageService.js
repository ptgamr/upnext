(function(){
    'use strict';

    angular.module('soundCloudify')
         .service("StorageService", StorageService);


    function StorageService($q, $indexedDB) {

        function PlaylistStorage() {

        }

        PlaylistStorage.prototype = {
            constructor: PlaylistStorage,
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

                        var query = store.query();
                        query.$index('sync');
                        query.$eq(0);

                        store.eachWhere(query).then(function(playlists) {
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
            insert: function (track) {
                $indexedDB.openStore('starred', function(store) {
                    store.insert(track);
                });
            },
            delete: function(trackId) {
                $indexedDB.openStore('starred', function(store) {
                    store.delete(trackId);
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