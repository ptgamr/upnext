(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("StarService", StarService);

    function StarService($rootScope, $http, API_ENDPOINT, $log, StorageService) {

        var trackIds = [];

        var Storage = StorageService.getStorageInstance('starred');

        var user;

        return {
            init: init,
            getTracks: getTracks,
            getLength: getLength,
            starTrack: starTrack,
            unstarTrack: unstarTrack,
            isTrackStarred: isTrackStarred
        };

        function init() {
            $rootScope.$on('identity.confirm', function(event, data) {
                if (data.identity.id && data.identity.email) {
                    user = data.identity;
                }
            });

            $rootScope.$on('sync.completed', function() {
                getFromStorage();
            });

            getFromStorage();
        }

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

            if (user) {
                $http({
                    url: API_ENDPOINT + '/star',
                    method: 'PUT',
                    data: {
                        added : [track],
                        removed: []
                    }
                }).success(function(data) {
                    if (data[0] && data[0][0]) {
                        $log.error('star track success');
                        track.internalId = data[0][0]['internalId'];
                        track.sync = 1;
                        Storage.upsert(track);
                    } else {
                        $log.error('star track: something wrong');
                    }

                }).error(function() {
                    $log.error('star track error');
                });
            }
        }

        function unstarTrack(track) {
            var trackId = track.id;

            var index = trackIds.indexOf(track.id);

            if (index > -1) {
                trackIds.splice(index, 1);

                Storage.getById(trackId).then(function(starredTrack) {
                    if (starredTrack.internalId) {
                        starredTrack.sync = 0;
                        starredTrack.deleted = 1;
                        Storage.upsert(starredTrack);

                        if (user) {
                            $http({
                                url: API_ENDPOINT + '/star',
                                method: 'PUT',
                                data: {
                                    removed: [starredTrack.internalId]
                                }
                            }).success(function(data) {
                                $log.error('star track success');
                                Storage.delete(starredTrack.id);
                            }).error(function() {
                                $log.error('star track error');
                            });
                        }

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
