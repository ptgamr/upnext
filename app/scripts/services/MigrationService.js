(function(angular){
    'use strict';

    angular.module('soundCloudify')
        .service('MigrationService', MigrationService);

    function MigrationService(PlaylistService, StarService, NowPlaying){

        return {
            migrate: migrate
        };

        /**
         * Migrate data from chromeStorage to indexedDB
         *
         * - nowplaying
         * - playlist
         * - starred
         * 
         */
        function migrate() {
            migrateNowPlaying();
            migratePlaylist();
        }

        function migratePlaylist() {
            chrome.storage.local.get('playlist', function(data) {
                var playlists = data['playlist'] || [];

                if (playlists.length) {
                    _.each(playlists, function(playlist, index) {

                        if (index === 0) {
                            _.each(playlist.tracks, function(starredTrack) {
                                StarService.starTrack(starredTrack);
                            });
                        } else {
                            PlaylistService.newPlaylist(playlist.name, playlist.tracks);
                        }

                    });

                    chrome.storage.local.set({
                        'playlist': []
                    });
                }
            });
        }

        function migrateNowPlaying() {
            chrome.storage.local.get('nowPlaying', function(data) {

                var tracks = data['nowPlaying'] || [];

                if(tracks.length) {
                    NowPlaying.addTracks(tracks);

                    chrome.storage.local.set({
                        'nowPlaying': []
                    });
                }
            });
        }
    };
}(angular));
