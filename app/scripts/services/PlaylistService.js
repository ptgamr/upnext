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

    function PlaylistService($rootScope, $log, $q, $http, API_ENDPOINT, StorageService){

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

        function newPlaylist(name, tracks) {

            return $q(function(resolve, reject) {

                tracks = tracks || [];

                var playlist = new Playlist(name, tracks);

                //always insert after the 'Starred' list
                playlist.order = playlistStore.items.length;
                playlistStore.items.unshift(playlist);
                Storage.insert(playlist);

                if (user) {
                    $http({
                        url: API_ENDPOINT + '/playlist',
                        method: 'POST',
                        data: playlist,
                    }).success(function(response) {
                        if (response.id) {
                            playlist.id = response.id;
                            playlist.order = response.order;
                            playlist.sync = 1;
                            Storage.upsert(playlist);
                        }
                    }).error(function() {
                        $log.error('error saving playlist');
                    });
                }

                resolve();
            });
        }

        function removePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');
            var playlist = getPlaylist(index);

            if (!playlist) return;

            playlist.deleted = 1;
            playlist.sync = 0;
            Storage.upsert(playlist);

            playlistStore.items.splice(index, 1);

            if (user && playlist.id) {
                $http({
                    url: API_ENDPOINT + '/playlist/' + playlist.id,
                    method: 'DELETE'
                }).success(function() {
                    Storage.delete(playlist.uuid);
                    $log.info('delete playlist succcessfully');
                }).error(function() {
                    $log.error('delete playlist ecounter an error');
                });
            }
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

            var copy = angular.copy(track);
            copy.internalId = '';
            copy.uuid = window.ServiceHelpers.ID();
            playlist.tracks.push(copy);
            Storage.upsert(playlist);

            if (user && playlist.id) {
                $http({
                    url: API_ENDPOINT + '/playlist/' + playlist.id,
                    method: 'PUT',
                    data: {
                        added: [copy]
                    }
                }).success(function(data) {
                    $log.info('add track success');
                    if (data[0] && data[0][0]) {
                        //have to update internalId - just in case user delete the song immediately
                        copy.internalId = data[0][0]['internalId'];
                        Storage.upsert(playlist);
                    }
                }).error(function() {
                    $log.error('add track failed');
                });
            }
        }

        function removeTrackFromPlaylist(trackIndex, playlistIndex) {

            if (typeof trackIndex === 'undefined' || isNaN(trackIndex))
                throw new Error('Error when remove track: trackIndex must be specified as number');

            var playlist = playlistStore.items[playlistIndex];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');


            playlist.tracks[trackIndex].deleted = 1;
            Storage.upsert(playlist);

            if (user && playlist.id && removal.internalId) {
                $http({
                    url: API_ENDPOINT + '/playlist/' + playlist.id,
                    method: 'PUT',
                    data: {
                        removed: [removal.internalId]
                    }
                }).success(function(data) {
                    $log.info('remove track success');
                    playlist.tracks.splice(trackIndex, 1)[0];
                    Storage.upsert(playlist);
                }).error(function() {
                    $log.error('remove track failed');
                });
            }
        }
    };
}());
