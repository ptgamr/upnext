(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("PlaylistService", PlaylistService);

    function Playlist(name) {
        if (!name)
            throw new Error('You have to specify a name when create a playlist');

        this.tracks = [];
        this.name = name;
        this.id = Date.now();
    }

    function _addTrackToPlaylist(track, playlist) {
        playlist.tracks.push(track);
    }

    function _addTracksToPlaylist(tracks, playlist) {
        playlist.tracks = playlist.tracks.concat(tracks);
    }

    function _removeTrackFromPlaylist(trackIndex) {
        if (typeof trackIndex === 'undefined' || isNaN(trackIndex))
            throw new Error('Error when remove track: trackIndex must be specified as number');
        playlist.tracks.splice(trackIndex, 1);
    }

    function PlaylistService($q){

        var PLAYLIST_STORAGE_KEY = 'playlist';

        var playlistStore;

        return {
            getList: getList,
            newPlaylist: newPlaylist,
            removePlaylist: removePlaylist,
            addTrackToPlaylist: addTrackToPlaylist,
            addTracksToPlaylist: addTracksToPlaylist
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
            return playlist;
        }

        function removePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            playlistStore.splice(index, 1);
            updateStorage();
        }

        function addTrackToPlaylist(track, index) {

            var playlist = playlistStore[index];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _addTrackToPlaylist(track, playlist);
            updateStorage();
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

            var playlist = playlistStore[playlistIndex];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _removeTrackFromPlaylist(trackIndex);
            updateStorage();
        }

        function updateStorage() {
            var storageObj = {};
            storageObj[PLAYLIST_STORAGE_KEY] = playlistStore;
            chrome.storage.local.set(storageObj);
        }
    };

}());
