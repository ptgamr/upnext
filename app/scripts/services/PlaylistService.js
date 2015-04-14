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

    function PlaylistService($q, $http, $timeout, UserService, Pouch){

        var PLAYLIST_STORAGE_KEY = 'playlist';

        var ready = false;

        var playlistDoc;

        Pouch.allDocs({include_docs: true}, function(err, doc) {

            if (doc.rows.length) {
                for (var i = 0 ; i < doc.rows.length; i++) {
                    if (doc.rows[i].doc.type === 'playlist') {
                        playlistDoc = doc.rows[i].doc;
                        break;
                    }
                }
            }

            if (!playlistDoc) {

                var starredList = new Playlist('Starred');

                playlistDoc = {
                    _id: new Date().toISOString(),
                    type: 'playlist',
                    items: [starredList]
                };

                Pouch.put(playlistDoc, function callback(err, result) {

                    if (!err) {
                        console.log('Successfully created a playlist doc!');
                    }

                });
            }
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

            return $q(function(resolve, reject) {
                getPlaylistDoc(resolve, reject);
            });

            function getPlaylistDoc(resolve, reject) {
                var timer;

                if (playlistDoc) {
                    resolve(playlistDoc);
                } else {
                    if (timer) {
                        $timeout.cancel(timer);
                    }

                    console.log('playlist has not initialized. retrying...');
                    timer = $timeout(function() {
                        getPlaylistDoc(resolve, reject);
                    }, 100);   
                }
            }
        }

        function newPlaylist(name) {
            var playlist = new Playlist(name);
            playlistDoc.items.splice(1, 0, playlist);
            updateStorage();
            return playlist;
        }

        function removePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            playlistDoc.items.splice(index, 1);
            updateStorage();
        }

        function getPlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            return playlistDoc.items[index];
        }

        function addTrackToPlaylist(track, index) {

            var playlist = playlistDoc.items[index];

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

            var playlist = playlistDoc.items[playlistIndex];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _removeTrackFromPlaylist(trackIndex);
            updateStorage();
        }

        function starTrack(track) {
            var starList = playlistDoc.items[0];

            if(!starList)
                throw new Error('starTrack(): Star Playlist not found. This should be reported.');

            _addTrackToPlaylist(track, starList);
            updateStorage();
        }

        function unstarTrack(track) {
            var starList = playlistDoc.items[0];

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
            var starList = playlistDoc.items[0];

            if(!starList)
                throw new Error('isTrackStarred() : Star Playlist not found. This should be reported.');

            for (var i = 0 ; i < starList.tracks.length; i++) {
                if (starList.tracks[i].id === track.id) {
                    return true;
                }
            }
        }

        function updateStorage() {
            Pouch.put(playlistDoc, function(err, result) {
                if (!err) {
                    console.log('Successfully updated to db!');
                }
            });
        }
    };

}());
