(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("StarService", StarService);

    function StarService($rootScope, StorageService, SyncService) {

        var trackIds = [];

        var Storage = StorageService.getStorageInstance('starred');

        $rootScope.$on('sync.completed', function() {
            getFromStorage();
        });

        return {
            getTracks: getTracks,
            getLength: getLength,
            starTrack: starTrack,
            unstarTrack: unstarTrack,
            isTrackStarred: isTrackStarred
        };

        function getFromStorage() {
            Storage.getTracks()
                .then(function(tracks) {
                    trackIds = _.map(tracks, function(track) { return track.id; });
                    $rootScope.$broadcast('starredList.ready');
                });
        };

        function getTracks() {
            return Storage.getTracks();
        }

        function getLength() {
            return trackIds.length;
        }

        function starTrack(track) {
            if (isTrackStarred(track)) {
                return;
            }
            trackIds.push(track.id);
            track.internalId = '';
            track.sync = 0;
            track.delete = 0;

            Storage.insert(track);
            SyncService.push().then(SyncService.bumpLastSynced);
        }

        function unstarTrack(track) {
            var trackId = track.id;

            var index = trackIds.indexOf(track.id);

            if (index > -1) {
                trackIds.splice(index, 1);

                Storage.getById(trackId).then(function(starredTrack) {
                    if (starredTrack.sync) {
                        starredTrack.sync = 0;
                        starredTrack.deleted = 1;
                        Storage.upsert(starredTrack);
                        SyncService.push().then(SyncService.bumpLastSynced);
                    } else {
                        Storage.delete(trackId);
                    }
                });
            }
        }

        function isTrackStarred(track) {
            return trackIds.indexOf(track.id) > -1;
        }

    }
}());