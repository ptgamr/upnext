(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("NowPlaying", NowPlayingService);

    function NowPlayingService($http, CLIENT_ID, $rootScope){
        
        var NOW_PLAYING_LIST_KEY = 'nowPlaying';
        var NOW_PLAYING_STATE_KEY = 'nowPlayingState';

        var onNowPlayingChange = null, onNowPlayingStateChange = null;

        chrome.storage.onChanged.addListener(function (changes, areaName) {
            if (changes['nowPlayingUpdatedBy'] &&
                    changes['nowPlayingUpdatedBy'].newValue.indexOf('background') > -1) {

                if (changes['nowPlaying'] && changes['nowPlaying'].newValue) {
                    if (onNowPlayingChange) {
                        onNowPlayingChange.call(null, changes['nowPlaying'].newValue);
                    }
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
        
        return {
            getList: getList,
            saveList: saveList,
            getState: getState,
            saveState: saveState,
            registerNowPlayingChangeHandler: registerNowPlayingChangeHandler,
            registerNowPlayingStateChangeHandler: registerNowPlayingStateChangeHandler
        };

        function registerNowPlayingChangeHandler(callback) {
            onNowPlayingChange = callback;
        }

        function registerNowPlayingStateChangeHandler(callback) {
            onNowPlayingStateChange = callback;
        }

        function getList(callback){
            return chrome.storage.local.get(NOW_PLAYING_LIST_KEY, function(data) {
                callback(data[NOW_PLAYING_LIST_KEY] || []);
            });
        }

        function saveList(list) {
            chrome.storage.local.set({
                'nowPlaying': list,
                'nowPlayingUpdatedBy': getStorageUpdateKey()
            });
            $rootScope.$broadcast('nowPlaying:updated');
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

        function getStorageUpdateKey() {
            return  'foreground-' + Date.now();
        }
    };

}());
