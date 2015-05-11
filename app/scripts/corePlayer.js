(function() {

    'use strict';

    var soundCloudify = angular.module('soundCloudify');

    soundCloudify.service('CorePlayer', function($rootScope, $window, $mdToast, Messaging, NowPlaying, CLIENT_ID, GATracker, LastFMAuthentication) {

        function debounce(fn, delay) {
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        }


        var self = this;

        //this is used for commincating with background (one way)
        var backgroundPage = chrome.extension.getBackgroundPage();
        
        this.nowplaying = NowPlaying.getList();
        this.state = NowPlaying.getState();

        this.add = function(track, andPlay) {

            andPlay = andPlay || true;

            if (track) {
                NowPlaying.addTrack(track).then(function() {
                    if (andPlay) {
                        self.play(0);
                    }
                });
            }
        };

        /**
         * Add track to position after the current index, in order to play this track  next
         */
        this.playNext = function(track) {
            if (track) {
                NowPlaying.addTrack(track, this.state.currentIndex + 1);
            }
        };

        /*
         * Clear the current list
         * Add all tracks to the list
         * Start play at position 0s
         */
        this.playAll = function(tracks) {
            NowPlaying.addTracks(tracks)
                .then(function() {
                    angular.extend(self.state, {
                        currentTrack: false,
                        currentIndex: 0,
                        playing: false,
                        currentTime: 0,
                        duration: 0
                    });
                    self.play(0);
                });
        };

        /**
         * Remove track at specific index
         */
        this.remove = function(index) {
            NowPlaying.removeTrack(index);

            if (this.state.currentIndex === index) {
                this.play(index);
            } else if (index < this.state.currentIndex){
                this.state.currentIndex --;
            }

            NowPlaying.saveState(this.state);
        };

        this.clear = function() {
            NowPlaying
                .removeAllTracks()
                .then(function() {
                    angular.extend(self.state, {
                        currentTrack: null,
                        currentIndex: 0,
                        playing: false,
                        currentTime: 0,
                        duration: 0
                    });

                    Messaging.sendClearMessage();
                    NowPlaying.saveState(self.state);
                });

        }

        this.play = function(index) {

            index = index || 0;

            var track = this.nowplaying.tracks[index];

            if (!track) {
                throw 'No track found for playing, index=' + index;
            }

            if (track) {
                this.state.playing = true;
                this.state.currentTime = 0;
                this.state.duration = 0;
                this.state.currentTrack = track;
                this.state.currentIndex = index;

                //un-flagged the error flag when retry
                if (track.error) {
                    track.error = false
                    //TODO
                    //NowPlaying.updateStorage();
                };

                NowPlaying.saveState(this.state);
                backgroundPage.mainPlayer.play(track);
            }
        };

        this.pause = function() {
            this.state.playing = false;
            NowPlaying.saveState(this.state);
            backgroundPage.mainPlayer.pause();
        };

        this.resume = function() {
            this.state.playing = true;
            NowPlaying.saveState(this.state);
            backgroundPage.mainPlayer.resume();
        };

        this.stop = function() {
            // this.state.playing = false;
            // this.state.currentTime = 0;
            // NowPlaying.saveState(this.state);
        };

        this.playPause = function(index) {
            if (typeof index !== 'undefined') {
                if (index === this.state.currentIndex) {
                    this.state.playing ? this.pause() : this.resume();
                } else {
                    this.play(index);
                }
                return;
            }

            this.state.playing ? this.pause() : this.resume();
        };

        this.next = function() {
            backgroundPage.mainPlayer.next();
        };

        this.previous = function() {
            backgroundPage.mainPlayer.prev();
        };

        this.seek = function(xpos) {
            this.state.currentTime = xpos * this.state.duration;
            backgroundPage.mainPlayer.seek(xpos);
        };

        this.updateState = function(data) {
            if(!this.state.currentTrack) {
                this.state.currentTrack = data.track;
                this.state.playing = true;
            }

            this.state.currentTime = data.currentTime;
            this.state.duration = data.duration;
        };

        this.isPlaying = function(trackId) {
            if (!this.state.currentTrack) return false;
            return this.state.currentTrack.id === trackId;
        };

        var deboundSaveVolume = debounce(function() {
            NowPlaying.saveState(self.state);
        }, 500);

        this.setVolume = function(volume) {
            this.state.volume = volume;
            backgroundPage.mainPlayer.setVolume(volume);
            deboundSaveVolume();
        };

        this.toggleRepeat = function() {
            if (this.state.repeat === 0) {
                this.state.repeat = 1; // repeat all
            } else if (this.state.repeat === 1) {
                this.state.repeat = 2; // repeat one
            } else {
                this.state.repeat = 0; // no repeat
            }
            NowPlaying.saveState(this.state);
            GATracker.trackPlayer('toggle repeat', this.state.repeat === 1 ? 'all' : this.state.repeat === 2 ? 'one' : 'none');
        };

        this.toggleShuffle = function() {
            this.state.shuffle = !this.state.shuffle;
            NowPlaying.saveState(this.state);
            GATracker.trackPlayer('toggle shuffle', this.state.shuffle ? 'on' : 'off');
        };

        this.toggleScrobble = function() {

            var self = this;

            if (!LastFMAuthentication.isAuth()) {
                LastFMAuthentication.auth(function() {
                    self.state.scrobble = true;
                });
            } else {
                self.state.scrobble = !self.state.scrobble;
            }

            NowPlaying.saveState(self.state);
            GATracker.trackPlayer('toggle scrobble', this.state.scrobble ? 'on' : 'off');
        };

        this.sendManualScrobble = function(manualScrobble) {
            Messaging.sendManualScrobbleMessage(manualScrobble);

            this.nowplaying.tracks[this.state.currentIndex].manualTrack = manualScrobble.track;
            this.nowplaying.tracks[this.state.currentIndex].manualArtist = manualScrobble.artist;

            //TODO
            //NowPlaying.updateStorage();
        };

        this.markCurrentTrackError = function() {
            this.state.currentTrack.error = true;
            this.nowplaying.tracks[this.state.currentIndex].error = true;
            //TODO
            //NowPlaying.updateStorage();

            NowPlaying.saveState(this.state);
            GATracker.trackPlayer('track error');
        };


        //Communication
        Messaging.registerTimeUpdateHandler(function(data) {
            $rootScope.$apply(function () {
                self.updateState.call(self, data);
            });
        });

        Messaging.registerErrorHandler(function() {
            $mdToast.show({
                templateUrl: 'scripts/views/toastError.html',
                hideDelay: 1000,
                position: 'bottom right',
                parent: angular.element(document.querySelector('#tab-content'))
            });

            self.markCurrentTrackError();
        });

        Messaging.registerEndedHandler(function() {
            self.stop();
        });

        Messaging.registerLastFmInvalidHandler(function() {
            self.state.currentTrack.lastFmValidate = false;
        });

        Messaging.registerLastFmScrobbledHandler(function() {
            self.state.currentTrack.scrobbled = true;
            self.state.currentTrack.lastFmValidate = true;
        })
    });
})();
