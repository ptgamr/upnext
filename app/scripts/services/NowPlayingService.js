(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("NowPlaying", NowPlayingService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';

    function NowPlayingService($http, CLIENT_ID, $rootScope){
        
        var NOW_PLAYING_LIST_KEY = 'nowPlaying';
        var NOW_PLAYING_STATE_KEY = 'nowPlayingState';
        var onNowPlayingChange = null, onNowPlayingStateChange = null;
        var nowPlaying = {
            tracks: []
        };

        chrome.storage.onChanged.addListener(function (changes, areaName) {
            if (changes['nowPlayingUpdatedBy'] &&
                    changes['nowPlayingUpdatedBy'].newValue.indexOf('background') > -1) {

                if (changes['nowPlaying'] && changes['nowPlaying'].newValue) {
                    nowPlaying.tracks = changes['nowPlaying'].newValue;
                }
            }

            if (changes['nowPlayingStateUpdatedBy'] &&
                    changes['nowPlayingStateUpdatedBy'].newValue.indexOf('background') > -1) {

                if (changes['nowPlayingState'] && changes['nowPlayingState'].newValue) {
                    if (onNowPlayingStateChange) {
                        onNowPlayingStateChange.call(null, changes['nowPlayingState'].newValue);
                    }
                }
            }
        });

        chrome.storage.local.get(NOW_PLAYING_LIST_KEY, function(data) {
            nowPlaying.tracks = data[NOW_PLAYING_LIST_KEY] || [];
        });

        return {
            getList: getList,
            addTrack: addTrack,
            addTracks: addTracks,
            removeTrack: removeTrack,
            updateStorage: updateStorage,
            getState: getState,
            saveState: saveState,
            registerNowPlayingStateChangeHandler: registerNowPlayingStateChangeHandler
        };


        function getList(callback){
            return nowPlaying;
        }

        function addTrack(track, position) {
            //we need to do a copy here to ensure each track we add
            //to the playlist will have a unique id
            track = angular.copy(track);
            track.uuid = window.ServiceHelpers.ID();
            track.sync = 0;

            if (position) {
                nowPlaying.tracks.splice(position, 0, track);
            } else {
                nowPlaying.tracks.unshift(track);
            }

            updateStorage();
        }

        function addTracks(tracks) {
            nowPlaying.tracks = _.map(tracks, function(track) {
                track = angular.copy(track);
                track.uuid = window.ServiceHelpers.ID();
                track.sync = 1;
                return track;
            });
            updateStorage();
        }

        function removeTrack(position) {
            nowPlaying.tracks.splice(position, 1);
            updateStorage();
        }

        function clear() {
            nowPlaying.tracks = [];
            updateStorage();
        }

        function updateStorage() {
            chrome.storage.local.set({
                'nowPlaying': nowPlaying.tracks,
                'nowPlayingUpdatedBy': getStorageUpdateKey()
            });
        }

        function saveState(state) {
            chrome.storage.local.set({
                'nowPlayingState': state,
                'nowPlayingUpdatedBy': getStorageUpdateKey()
            });
        }

        function getState(callback) {
            return chrome.storage.local.get(NOW_PLAYING_STATE_KEY, function(data) {
                callback(data[NOW_PLAYING_STATE_KEY] || {});
            })
        }

        function registerNowPlayingStateChangeHandler(callback) {
            onNowPlayingStateChange = callback;
        }

        function getStorageUpdateKey() {
            return  'foreground-' + Date.now();
        }
    };

}());
