(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("PlaylistService", PlaylistService);

    function Playlist(name) {
        if (!name)
            throw new Error('You have to specify a name when create a playlist');

        this.tracks = [];
        this.name = name;
        this.type = 'playlist';
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

        var playlistDoc = {
            items: []
        };

        Pouch.allDocs({include_docs: true}, function(err, doc) {

            if (doc.rows.length) {
                for (var i = 0 ; i < doc.rows.length; i++) {
                    if (doc.rows[i].doc.type === 'playlist') {
                        playlistDoc.items.push(doc.rows[i].doc);
                    }
                }
            }

            if (!playlistDoc.items.length) {

                var starredList = new Playlist('Starred');

                Pouch.post(starredList, function callback(err, result) {
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
            sharePlaylist: sharePlaylist,
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

                if (playlistDoc.items.length) {
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
            updateStorage(playlist, 'post');
            return playlist;
        }

        function removePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            var removed = playlistDoc.items.splice(index, 1);
            updateStorage(removed, 'delete');
        }

        function getPlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            return playlistDoc.items[index];
        }

        function sharePlaylist(index) {
            if (typeof index === 'undefined' || isNaN(index))
                    throw new Error('Error when remove playlist: index must be specified as number');

            var playlist = playlistDoc.items[index];

            playlist.public = true;

            updateStorage(playlist, 'put');

            return playlist.id;
        }

        function addTrackToPlaylist(track, index) {

            var playlist = playlistDoc.items[index];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _addTrackToPlaylist(track, playlist);
            updateStorage(playlist, 'put');
        }

        function addTracksToPlaylist(tracks, playlist) {
            
            if(!tracks)
                throw new Error('Error when adding tracks: Track is undefined');

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _addTracksToPlaylist(tracks, playlist);
            updateStorage(playlist, 'put');
        }

        function removeTrackFromPlaylist(trackIndex, playlistIndex) {

            var playlist = playlistDoc.items[playlistIndex];

            if(!playlist)
                throw new Error('Error when adding track: Playlist not found.');

            _removeTrackFromPlaylist(trackIndex);
            updateStorage(playlist, 'put');
        }

        function starTrack(track) {
            var starList = playlistDoc.items[0];

            if(!starList)
                throw new Error('starTrack(): Star Playlist not found. This should be reported.');

            _addTrackToPlaylist(track, starList);
            updateStorage(starList, 'put');
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
            updateStorage(starList, 'put');
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

        function updateStorage(playlist, action) {

            if (!action || !Pouch[action]) throw new Error("correct action has to specified when update Pouch");

            Pouch[action](playlist, function(err, result) {
                if (!err) {
                    playlist._rev = result.rev;
                    console.log('Successfully updated to db!');
                }
            });
        }
    };

}());
