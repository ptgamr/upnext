(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("PlaylistService", PlaylistService);

    var ORIGIN_LOCAL = 'l';
    var ORIGIN_SERVER = 's';

    function Playlist(name) {
        if (!name)
            throw new Error('You have to specify a name when create a playlist');

        this.tracks = [];
        this.name = name;
        this.id = Date.now();
        this.origin = ORIGIN_LOCAL; //playlist in local only
    }

    function PlaylistService($rootScope, $q, $http){

        var PLAYLIST_STORAGE_KEY = 'playlist';

        var PLAYLIST_ENDPOINT = 'http://localhost:3000/playlist';

        var playlistStore = {
            items: null
        };

        var user;

        init();


        return {
            isReady: isReady,
            getList: getList,
            newPlaylist: newPlaylist,
            removePlaylist: removePlaylist,
            getPlaylist: getPlaylist,
            addTrackToPlaylist: addTrackToPlaylist,
            addTracksToPlaylist: addTracksToPlaylist,
            starTrack: starTrack,
            unstarTrack: unstarTrack,
            isTrackStarred: isTrackStarred
        };

        function init() {
            
            $rootScope.$on('identity.confirm', function(event, data) {
                if (data.identity.id && data.identity.email) {
                    onUserAuthenticated(data.identity);
                }
            });

            $rootScope.$on('sync', function() {
                syncWithChromeStorage();
            });

            syncWithChromeStorage();
        }

        function syncWithChromeStorage() {
            chrome.storage.local.get(PLAYLIST_STORAGE_KEY, function(data) {
                playlistStore.items = data[PLAYLIST_STORAGE_KEY] || [];

                //the Starred Playlist should be automatically added & can not be removed
                if (!playlistStore.items.length) {
                    newPlaylist('Starred');
                }
            });
        }

        function onUserAuthenticated(identity) {
            user = identity;
        }

        function isReady() {
            return ready;
        }

        function getList() {
            return $q(function(resolve, reject) {
                resolve(playlistStore)
            });
        }

        function newPlaylist(name) {

            return $q(function(resolve, reject) {

                var playlist = new Playlist(name);

                if (user) {

                    $http({
                        url: PLAYLIST_ENDPOINT,
                        method: 'POST',
                        data: playlist,
                    }).success(function(response) {

                        playlist.id = response.id;
                        playlist.updated = response.updated;

                        playlist.origin = ORIGIN_SERVER;

                        playlistStore.items.splice(1, 0, playlist);
                        updateStorage();

                        resolve();

                    }).error(function() {
                        console.log('error POST a playlist');
                        reject();
                    });

                } else {
                    playlistStore.items.splice(1, 0, playlist);
                    updateStorage();
                    resolve();
                }

            });
            
        }

        function removePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            playlistStore.items.splice(index, 1);
            updateStorage();
        }

        function getPlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            return playlistStore.items[index];
        }

        function addTrackToPlaylist(track, index) {

            var playlist = playlistStore.items[index];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _addTrackToPlaylist(track, playlist);
        }

        function addTracksToPlaylist(tracks, playlist) {
            
            if(!tracks)
                throw new Error('Error when adding tracks: Track is undefined');

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _addTracksToPlaylist(tracks, playlist);
            updateStorage();
        }

        function removeTrackFromPlaylist(trackIndex, playlistIndex) {

            var playlist = playlistStore.items[playlistIndex];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _removeTrackFromPlaylist(trackIndex);
            updateStorage();
        }

        function starTrack(track) {
            var starList = playlistStore.items[0];

            if(!starList)
                throw new Error('starTrack(): Star Playlist not found. This should be reported.');

            _addTrackToPlaylist(track, starList);
        }

        function unstarTrack(track) {
            var starList = playlistStore.items[0];

            if(!starList)
                throw new Error('unstarTrack(): Star Playlist not found. This should be reported.');

            for (var i = 0 ; i < starList.tracks.length; i++) {
                if (starList.tracks[i].id === track.id) {
                    _removeTrackFromPlaylist(i, starList);
                    break;
                }
            }
            updateStorage();
        }

        function isTrackStarred(track) {
            var starList = playlistStore.items[0];

            if(!starList)
                throw new Error('isTrackStarred() : Star Playlist not found. This should be reported.');

            for (var i = 0 ; i < starList.tracks.length; i++) {
                if (starList.tracks[i].id === track.id) {
                    return true;
                }
            }
        }

        function updateStorage() {
            var storageObj = {};
            storageObj[PLAYLIST_STORAGE_KEY] = playlistStore.items;
            chrome.storage.local.set(storageObj);
        }

        function _addTrackToPlaylist(track, playlist) {

            return $q(function(resolve, reject) {

                if (user) {

                    $http({
                        url: PLAYLIST_ENDPOINT + '/' + playlist.id,
                        method: 'PUT',
                        data: {
                            added: track
                        }
                    }).success(function() {

                        var copy = angular.copy(track);
                        copy.uuid = window.ServiceHelpers.ID();
                        playlist.tracks.push(copy);
                        updateStorage();

                        resolve();

                    }).error(function() {
                        console.log('error POST a playlist');
                        reject();
                    });

                } else {
                    
                    var copy = angular.copy(track);
                    copy.uuid = window.ServiceHelpers.ID();
                    playlist.tracks.push(copy);
                    updateStorage();
                    resolve();
                }

            });
        }

        function _addTracksToPlaylist(tracks, playlist) {

            var copies = tracks.map(function(track) {
                var copy = angular.copy(track);
                copy.uuid = window.ServiceHelpers.ID();
                return copy;
            })

            playlist.tracks = playlist.tracks.concat(copies);
        }

        function _removeTrackFromPlaylist(trackIndex, playlist) {
            if (typeof trackIndex === 'undefined' || isNaN(trackIndex))
                throw new Error('Error when remove track: trackIndex must be specified as number');
            playlist.tracks.splice(trackIndex, 1);
        }
    };

}());
