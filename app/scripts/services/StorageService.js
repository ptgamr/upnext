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
            delete: function(playlist) {
                $indexedDB.openStore('playlist', function(store) {
                    store.delete(playlist);
                });
            },
            getAllPlaylists: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('playlist', function(store) {
                        store.getAll().then(function(playlist) {  
                            resolve(_.sortBy(playlist, 'order').reverse());
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
                        store.getAll().then(function(tracks) {  
                            resolve(_.sortBy(tracks, 'order').reverse());
                        });
                    });
                });
            }
        };

        function StarStorage() {

        }

        return {
            getStorageInstance: getStorageInstance
        }

        function getStorageInstance(storage) {
            switch(storage) {
                case 'playlist':
                    return new PlaylistStorage();
                case 'nowplaying':
                    return new NowplayingStorage();
                case 'star':
                    return new StarStorage();
            }
            return null;
        }
    }

}());