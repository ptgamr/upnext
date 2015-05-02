(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("NowPlaying", NowPlayingService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';

    function NowPlayingService($http, $q, CLIENT_ID, $rootScope, API_ENDPOINT, SyncService, StorageService){

        var user;
        var backgroundPage = chrome.extension.getBackgroundPage();

        //local cache, used by CorePlayer, and is watched by AngularJS for changes
        var nowplaying = {
            tracks: [],
            trackIds: []
        };
        var state = backgroundPage.mainPlayer.state;

        //Storage API for simplify IndexedDB interaction
        var Storage = StorageService.getStorageInstance('nowplaying');

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

        /**
         * Add a single track to nowplaying list
         */
        function addTrack(track, position) {

            return $q(function(resolve, reject) {

                //we need to do a copy here to ensure each track we add
                //to the playlist will have a unique id
                track = angular.copy(track);
                track.uuid = window.ServiceHelpers.ID();
                track.sync = 0;
                track.deleted = 0;

                if (position && nowplaying.tracks.length >= 1 ) {
                    track.order = nowplaying.tracks[position - 1].order;
                    nowplaying.tracks.splice(position, 0, track);
                    nowplaying.trackIds.splice(position, 0, track.uuid);

                    var tobeUpsert = [track];

                    _.each(nowplaying.tracks, function(track, index) {
                        if (index < position) {
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

                SyncService.push().then(SyncService.bumpLastSynced);

                resolve();

            });
        }

        /**
         * Add multiple tracks to nowplaying
         */
        function addTracks(tracks) {

            return $q(function(resolve, reject) {

                removeAllTracks(false).then(function() {

                    var tracksToAdd = _.map(tracks, function(track) {
                        track = angular.copy(track);
                        track.uuid = window.ServiceHelpers.ID();
                        track.sync = 0;
                        track.deleted = 0;
                        return track;
                    });

                    nowplaying.tracks = tracksToAdd;
                    nowplaying.trackIds = _.map(nowplaying.tracks, function(track) {
                        return track.uuid;
                    });

                    backgroundPage.mainPlayer.saveTrackIds(nowplaying.trackIds);

                    Storage.insert(tracksToAdd);

                    SyncService.push().then(SyncService.bumpLastSynced);

                    resolve();
                });

            });

        }

        /**
         * Remove track from now playing
         */
        function removeTrack(position) {

            return $q(function(resolve, reject) {
                
                var track = nowplaying.tracks[position];
                
                if (!track) reject();

                if (track) {
                    nowplaying.tracks.splice(position, 1);
                    nowplaying.trackIds.splice(position, 1);

                    //mark the track as deleted for the SyncService to know how to handle it
                    track.deleted = 1;
                    track.sync = 0;
                    Storage.upsert([track]);
                }

                backgroundPage.mainPlayer.saveTrackIds(nowplaying.trackIds);

                SyncService.push().then(SyncService.bumpLastSynced);

                resolve();
            });
        }

        /**
         * Remove all tracks from nowplaying
         */
        function removeAllTracks(triggerSync) {

            return $q(function(resolve, reject) {
                
                triggerSync = typeof triggerSync === 'undefined' ? true : triggerSync;

                _.each(nowplaying.tracks, function(track) {
                    track.deleted = 1;
                    track.sync = 0;
                });

                Storage.upsert(nowplaying.tracks);

                nowplaying.tracks = [];
                nowplaying.trackIds = [];
                backgroundPage.mainPlayer.saveTrackIds([]);

                if (triggerSync) {
                    SyncService.push().then(SyncService.bumpLastSynced);
                }

                resolve();
            });
        }

        /**
         * Save state
         */
        function saveState(newState) {
            state = newState;
            backgroundPage.mainPlayer.saveState(newState);
        }

        /**
         * Get the state getting from the background
         */
        function getState(callback) {
            return state;
        }
    };

}());
