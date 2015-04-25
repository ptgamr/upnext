(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("StarService", StarService);

    function StarService($q, $indexedDB) {

        var trackIds = [];

        //Storage API for simplify IndexedDB interaction
        var Storage = {
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
            getAll: function() {
                return $q(function(resolve, reject) {
                    $indexedDB.openStore('starred', function(store) {
                        store.getAll().then(function(tracks) {  
                            resolve(tracks);
                        });
                    });
                });
            }
        };

        Storage.getAll().then(function(tracks) {
            //star is tracked by the track original id
            trackIds = _.map(tracks, function(track) {
                return track.id;
            })
        });

        return {
            starTrack: starTrack,
            unstarTrack: unstarTrack,
            isTrackStarred: isTrackStarred
        };

        function starTrack(track) {
            Storage.insert(track);
        }

        function unstarTrack(track) {
            var trackId = track.id;
            Storage.delete(trackId);
        }

        function isTrackStarred(track) {
            return trackIds.indexOf(track.id) > -1;
        }

    }

}());