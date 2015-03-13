(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("PlaylistService", PlaylistService);

    function Playlist(name) {
        if (!name)
            throw new Error('You have to specify a name when create a playlist');

        this.songs = [];
        this.name = name;
        this.id = Date.now();
    }

    Playlist.prototype = {
        constructor: Playlist,
        addSong: function(song) {
            this.songs.push(song);
        },
        removeSong: function(index) {
            if (typeof index === 'undefined' || isNaN(index))
                throw new Error('Error when remove song: index must be specified as number');
            this.songs.splice(index, 1);
        }
    }

    function PlaylistService($q){

        var PLAYLIST_STORAGE_KEY = 'playlist';

        var playlistStore;

        return {
            getList: getList,
            newPlaylist: newPlaylist,
            removePlaylist: removePlaylist,
            addSongToPlaylist: addSongToPlaylist,
        };

        function getList() {

            var defer = $q.defer();

            if (typeof playlistStore === 'undefined') {
                chrome.storage.local.get(PLAYLIST_STORAGE_KEY, function(data) {
                    playlistStore = data[PLAYLIST_STORAGE_KEY] || [];
                    defer.resolve(playlistStore);
                });
            } else {
                defer.resolve(playlistStore);
            }

            return defer.promise;
        }

        function newPlaylist(name) {
            var playlist = new Playlist(name);
            playlistStore.unshift(playlist);
            updateStorage();
        }

        function removePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            playlistStore.splice(index, 1);
            updateStorage();
        }

        function addSongToPlaylist(song, index) {

            var playlist = playlistStore[index];

            if(!playlist)
                throw new Error('Error when adding song: Playlist not found.');

            playlist.addSong(song);
            updateStorage();
        }

        function removeSongFromPlaylist(songIndex, playlistIndex) {

            var playlist = playlistStore[playlistIndex];

            if(!playlist)
                throw new Error('Error when adding song: Playlist not found.');

            playlist.removeSong(songIndex);
            updateStorage();
        }

        function updateStorage() {
            var storageObj = {};
            storageObj[PLAYLIST_STORAGE_KEY] = playlistStore;
            chrome.storage.local.set(storageObj);
        }
    };

}());
