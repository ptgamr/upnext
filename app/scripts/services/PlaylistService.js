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
        var copy = angular.copy(track);
        copy.uuid = window.ServiceHelpers.ID();
        playlist.tracks.push(copy);
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

    function PlaylistService($q){

        var PLAYLIST_STORAGE_KEY = 'playlist';

        var ready = false;

        var playlistStore = {
            items: null
        };

        getList().then(function() {
            ready = true;
        });

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

        function isReady() {
            return ready;
        }

        function getList() {

            var defer = $q.defer();

            if (playlistStore.items === null) {
                chrome.storage.local.get(PLAYLIST_STORAGE_KEY, function(data) {
                    playlistStore.items = data[PLAYLIST_STORAGE_KEY] || [];

                    //the Starred Playlist should be automatically added & can not be removed
                    if (!playlistStore.items.length) {
                        playlistStore.items.push(new Playlist('Starred'));
                        updateStorage();
                    }

                    defer.resolve(playlistStore);
                });
            } else {
                defer.resolve(playlistStore);
            }

            return defer.promise;
        }

        function newPlaylist(name) {
            var playlist = new Playlist(name);
            playlistStore.items.splice(1, 0, playlist);
            updateStorage();
            return playlist;
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
            updateStorage();
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
    };

}());
