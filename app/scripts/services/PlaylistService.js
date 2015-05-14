(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("PlaylistService", PlaylistService);

    function Playlist(name, tracks) {
        if (!name)
            throw new Error('You have to specify a name when create a playlist');

        this.tracks = tracks || [];
        this.name = name;
        this.uuid = window.ServiceHelpers.ID();
        this.sync = 0; //playlist in local only
        this.deleted = 0;
    }

    function PlaylistService($rootScope, $q, $http, SyncService, API_ENDPOINT, StorageService){

        var PLAYLIST_ENDPOINT = API_ENDPOINT + '/playlist';

        //Storage API for simplify IndexedDB interaction
        var Storage = StorageService.getStorageInstance('playlist');

        var playlistStore = {
            items: []
        };

        var user;

        init();

        return {
            getList: getList,
            newPlaylist: newPlaylist,
            removePlaylist: removePlaylist,
            getPlaylist: getPlaylist,
            addTrackToPlaylist: addTrackToPlaylist,
            addTracksToPlaylist: addTracksToPlaylist,
            removeTrackFromPlaylist: removeTrackFromPlaylist 
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

            Storage.getAllPlaylists()
                    .then(function(playlists) {
                        playlistStore.items = playlists || [];
                    });
        }

        function getList() {
            return playlistStore;
        }

        function newPlaylist(name, saveToServer, tracks) {

            return $q(function(resolve, reject) {

                //TODO: remove this
                saveToServer = typeof saveToServer === 'undefined' ? true : saveToServer;

                tracks = tracks || [];

                var playlist = new Playlist(name, tracks);

                //always insert after the 'Starred' list
                playlist.order = playlistStore.items.length ? playlistStore.items[0].order + 1 : 0; 
                playlistStore.items.unshift(playlist);
                Storage.insert(playlist);

                SyncService.push().then(SyncService.bumpLastSynced);

                resolve();
            });
        }

        function removePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');
            var playlist = getPlaylist(index);
            playlist.deleted = 1;
            playlist.sync = 0;

            Storage.upsert(playlist);

            SyncService.push().then(SyncService.bumpLastSynced);
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
        }

        function removeTrackFromPlaylist(trackIndex, playlistIndex) {

            var playlist = playlistStore.items[playlistIndex];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _removeTrackFromPlaylist(trackIndex, playlist);
        }

        function _addTrackToPlaylist(track, playlist) {

            return $q(function(resolve, reject) {

                var copy = angular.copy(track);
                copy.internalId = '';
                copy.uuid = window.ServiceHelpers.ID();
                copy.deleted = 0;
                copy.sync = 0;
                playlist.tracks.push(copy);
                playlist.sync = 0; //mark as changed
                Storage.upsert(playlist);

                SyncService.push().then(SyncService.bumpLastSynced);
            });
        }

        function _addTracksToPlaylist(tracks, playlist) {

            var copies = tracks.map(function(track) {
                var copy = angular.copy(track);
                copy.internalId = '';
                copy.uuid = window.ServiceHelpers.ID();
                copy.deleted = 0;
                copy.sync = 0;
                return copy;
            })

            playlist.tracks = playlist.tracks.concat(copies);
            playlist.sync = 0;  //mark as changed

            Storage.upsert(playlist);
            SyncService.push().then(SyncService.bumpLastSynced);
        }

        function _removeTrackFromPlaylist(trackIndex, playlist) {
            if (typeof trackIndex === 'undefined' || isNaN(trackIndex))
                throw new Error('Error when remove track: trackIndex must be specified as number');

            playlist.tracks[trackIndex].deleted = 1;
            playlist.sync = 0;

            Storage.upsert(playlist);

            SyncService.push().then(SyncService.bumpLastSynced);
        }
    };
}());
