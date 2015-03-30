(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("NowPlaying", NowPlayingService);

    function NowPlayingService($http, CLIENT_ID, $rootScope){
        
        var NOW_PLAYING_LIST_KEY = 'nowPlaying';
        var NOW_PLAYING_STATE_KEY = 'nowPlayingState';

        return {
            getList: getList,
            saveList: saveList,
            getState: getState,
            saveState: saveState
        };

        function getList(callback){
            return chrome.storage.sync.get(NOW_PLAYING_LIST_KEY, function(data) {
                callback(data[NOW_PLAYING_LIST_KEY] || []);
            });
        }

        function saveList(list) {
            var nowPlayingObj = {};
            nowPlayingObj[NOW_PLAYING_LIST_KEY] = list;
            chrome.storage.sync.set(nowPlayingObj);
            $rootScope.$broadcast('nowPlaying:updated');
        }

        function saveState(state) {
            var stateObj = {};
            stateObj[NOW_PLAYING_STATE_KEY] = state;
            chrome.storage.sync.set(stateObj);
        }

        function getState(callback) {
            return chrome.storage.sync.get(NOW_PLAYING_STATE_KEY, function(data) {
                callback(data[NOW_PLAYING_STATE_KEY] || {});
            })
        }
    };

}());
