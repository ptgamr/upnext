'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  //console.log('previousVersion', details.previousVersion);
});

/**
 * Notification show only one if we don't change the priority
 * http://stackoverflow.com/questions/26350747/chrome-notifications-update-or-create/26358154#26358154
 */
var Utils = {
    createOrUpdateNotification: function(id, options, callback) {

      var views = chrome.extension.getViews({ type: "popup" });

      //dont show notification if popup window is open
      if (views.length) return;

      // Try to lower priority to minimal "shown" priority
      chrome.notifications.update(id, {priority: 0}, function(existed) {
        if(existed) {
          // console.log("notification existed, update priority");
          var targetPriority = options.priority || 0;
          options.priority = 1;
          // Update with higher priority
          chrome.notifications.update(id, options, function() {
            // console.log("notification shown");
            // console.log(options);
            callback(true);
          });
        } else {
          chrome.notifications.create(id, options, function() {
            callback(false); // Created
          });
        }
      });
    },
    random: function(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
};

var CLIENT_ID = '849e84ac5f7843ce1cbc0e004ae4fb69';
var ORIGIN_YOUTUBE = 'yt';
var ORIGIN_SOUNDCLOUD = 'sc';

var currentPort;

/**
 * =====================================
 *          SOUNDCLOUD PLAYER
 * =====================================
 */
var SoundCloudPlayer = function(opts) {
    var self = this;

    this.audio = document.createElement('audio');
    this.audio.volume = 0.5;

    this.onTimeUpdate = opts.onTimeUpdate;
    this.onEnded = opts.onEnded;
    this.onError = opts.onError;

    this.audio.addEventListener('timeupdate', function() {
        self.onTimeUpdate(self.audio.currentTime, self.audio.duration);
    }, false);

    this.audio.addEventListener('ended', this.onEnded, false);

    this.audio.addEventListener('error', this.onError, false);
};

SoundCloudPlayer.prototype = {
    
    constructor: SoundCloudPlayer,

    play: function(track) {
        var src = track.streamUrl + '?client_id=' + CLIENT_ID;

        if (src === this.audio.src) {
            this.replay();
        } else {
            this.audio.src = src;
            this.audio.play();
        }

    },
    resume: function() {
        this.audio.play();
    },
    pause: function() {
        this.audio.pause();
    },
    stop: function() {
        this.audio.pause();
        this.audio.currentTime = 0;
    },
    replay: function() {
        this.stop();
        this.resume();
    },
    seek: function(xpos) {
        if (!this.audio.readyState) return false;
        this.audio.currentTime = (xpos * this.audio.duration);
    },
    clear: function() {
        this.audio.pause();
        this.audio.src = '';
        this.audio.removeAttribute('src');
    },
    setVolume: function(volume) {
        this.audio.volume = volume;
    }
};

/**
 * =====================================
 *          YOUTUBE PLAYER
 * =====================================
 */
var YoutubePlayer = function(opts) {
    this.player = null;
    this.playerReady = false;
    this.onTimeUpdate = opts.onTimeUpdate;
    this.onEnded = opts.onEnded;
    this.onError = opts.onError;
};

YoutubePlayer.prototype = {
    
    constructor: YoutubePlayer,

    setPlayer: function(player) {
        this.player = player;
    },

    play: function(track) {
        if(this.playerReady) {
            this.player.loadVideoById({videoId: track.id});
        }
    },
    resume: function() {
        this.player.playVideo();
    },
    pause: function() {
        this.player.pauseVideo();
    },
    stop: function() {
        this.player.stopVideo();
    },
    replay: function() {
        this.player.seekTo(0);
    },
    seek: function(xpos) {
        this.player.seekTo(xpos * this.player.getDuration());
    },
    clear: function() {
        this.stop();
        this.player.clearVideo();
    },
    setVolume: function(volume) {
        this.player.setVolume(volume * 100);

        if( this.player.isMuted()) {
            this.player.unMute();
        }
    }
};

/**
 * =====================================
 *          MAIN PLAYER
 * =====================================
 */
var Player = function(soundcloudPlayer, youtubePlayer) {
    this.soundcloudPlayer = soundcloudPlayer;
    this.youtubePlayer = youtubePlayer;
    this.init();
};

Player.prototype = {

    constructor: Player,

    init: function() {

        var self = this;

        self.tracks = [];
        self.state = {};
        self.notificationId = '';
        self.activePlayer = null;

        chrome.storage.local.get('nowPlaying', function(data) {
            self.tracks = data['nowPlaying'] || [];
        });

        chrome.storage.local.get('nowPlayingState', function(data) {
            self.state = data['nowPlayingState'] || {};
        });

        chrome.storage.sync.get('scConfig', function(data) {
            self.configuration = data['scConfig'] || {showNotification: true};
        });

        chrome.storage.onChanged.addListener(function (changes, areaName) {

            if (changes['nowPlaying']) {
                self.tracks = changes['nowPlaying'].newValue;

                if(!self.tracks.length) {
                    self.clear.call(self);
                }
            }

            if (changes['nowPlayingState'] && self.configuration.showNotification) {

                var oldValue = changes['nowPlayingState'].oldValue,
                    lastTrackId = oldValue && oldValue.currentTrack ?  oldValue.currentTrack.id : null;

                self.state = changes['nowPlayingState'].newValue;

                if (self.state.currentTrack && lastTrackId !== self.state.currentTrack.id) {
                    var notificationOptions = {
                        type: "basic",
                        title: "Playing Track",
                        message: self.state.currentTrack.title,
                        iconUrl: self.state.currentTrack.artworkUrl
                    };

                    Utils.createOrUpdateNotification('track-change', notificationOptions, function() {});
                }
            }

            if (changes['scConfig']) {
                self.configuration = changes['scConfig'].newValue;
            }
        });

    },

    next: function() {

        var nextIndex;

        if (this.state.shuffle) {
            
            nextIndex = Utils.random(0, this.tracks.length - 1);

        } else {
            
            nextIndex = this.state.currentIndex + 1;

            if (nextIndex >= this.tracks.length) {
                nextIndex = 0;
            }
        }

        var nextTrack = this.tracks[nextIndex];

        if (nextTrack) {

            this.play(nextTrack);

            this.state.currentIndex = nextIndex;
            this.state.currentTrack = nextTrack;
            this.state.playing = true;

            if (currentPort) {
                currentPort.postMessage({message: 'scd.trackChangedFromBackground', data: this.state});
            }

            chrome.storage.local.set({'nowPlayingState': this.state});
        }
        //  else {
        //     this.state.currentIndex ++;
        //     this.next();
        // }
    },

    prev: function() {
        var currentIndex = this.state.currentIndex;
        var nextIndex = currentIndex - 1;

        if (nextIndex < 0) {
            nextIndex = this.tracks.length -1;
        }

        var nextTrack = this.tracks[nextIndex];

        if (nextTrack) {

            this.play(nextTrack);

            this.state.currentIndex = nextIndex;
            this.state.currentTrack = nextTrack;
            this.state.playing = true;

            if (currentPort) {
                currentPort.postMessage({message: 'scd.trackChangedFromBackground', data: this.state});
            }
            chrome.storage.local.set({'nowPlayingState': this.state});
        }
    },

    play: function(track) {

        if (track.origin === ORIGIN_YOUTUBE) {
            this.soundcloudPlayer.clear();
            this.youtubePlayer.play(track);
            this.activePlayer = youtubePlayer;
        } else {
            this.youtubePlayer.clear();
            this.soundcloudPlayer.play(track);
            this.activePlayer = soundcloudPlayer;
        }


        chrome.browserAction.setIcon({path: 'images/icon-38.png'});

        if (this.state.scrobble) {
            var self = this;
            window.LastFM.checkTrackInfo(track, function(lastFmTrack) {
                console.log('checkTrackInfo: success');
                if (lastFmTrack.track) {
                    self.state.currentTrack.startTimestamp = Math.floor(Date.now() / 1000);
                    self.state.currentTrack.lastFmTrack = lastFmTrack.track.name;
                    self.state.currentTrack.lastFmArtirst = lastFmTrack.track.artist.name;
                    //TODO: inform frontend?
                    window.LastFM.updateNowPlaying({
                        track: lastFmTrack.track.name,
                        artist: lastFmTrack.track.artist.name
                    });
                }
            }, function() {
                self.state.currentTrack.lastFmValidate = false;
                console.log('checkTrackInfo: error');
            })
        }
    },

    pause: function() {
        if(this.activePlayer) {
            this.activePlayer.pause();
        }
        chrome.browserAction.setIcon({path: 'images/icon-38-pause.png'});
    },

    resume: function() {

        if (!this.activePlayer) {
            this.play(this.state.currentTrack);
            return;
        }

        this.activePlayer.resume();
        chrome.browserAction.setIcon({path: 'images/icon-38.png'});
    },

    replay: function() {
        if (this.activePlayer) {
            this.activePlayer.replay();
        }
    },

    stop: function() {
        if (this.activePlayer) {
            this.activePlayer.stop();
        }

        this.state.playing = false;
        this.state.currentTime = 0;
        chrome.storage.local.set({'nowPlayingState': this.state});
        chrome.browserAction.setIcon({path: 'images/icon-38-pause.png'});
    },

    clear: function() {
        if(this.activePlayer) {
            this.activePlayer.clear();
        }
    },

    seek: function(xpos) {
        this.activePlayer.seek(xpos);
    },

    setVolume: function(volume) {
        this.soundcloudPlayer.setVolume(volume);
        this.youtubePlayer.setVolume(volume);
    }
};


var soundcloudPlayer = new SoundCloudPlayer({
    onTimeUpdate: onTimeUpdate,
    onEnded: onEnded,
    onError: onError
});

var youtubePlayer = new YoutubePlayer({
    onTimeUpdate: onTimeUpdate,
    onEnded: onEnded,
    onError: onError
});

var mainPlayer = new Player(soundcloudPlayer, youtubePlayer);

function onTimeUpdate(currentTime, duration) {
    
    if (currentTime > 10 && mainPlayer.state.currentTrack.lastFmTrack && !mainPlayer.state.currentTrack.hasScrobbled) {
        window.LastFM.scrobble({
            track: mainPlayer.state.currentTrack.lastFmTrack,
            artist: mainPlayer.state.currentTrack.lastFmArtirst,
            startTimestamp: mainPlayer.state.currentTrack.startTimestamp
        });

        mainPlayer.state.currentTrack.hasScrobbled = true;
    }

    if (!currentPort) return;
    currentPort.postMessage({message: 'scd.timeupdate', data: {
        currentTime: currentTime,
        duration: duration
    }});
}

function onEnded() {
    if (mainPlayer.state.repeat === 0) {
        mainPlayer.stop();
        mainPlayer.seek(0);
        currentPort.postMessage({message: 'scd.ended'});
    } else if (mainPlayer.state.repeat === 1) {
        mainPlayer.next.call(mainPlayer);
    } else {
        mainPlayer.replay.call(mainPlayer);
    }
}

function onError(e) {
    console.log(e);
    if (!currentPort) return;
    currentPort.postMessage({message: 'scd.error'});
}



/**
 * ===================================================
 *                YOUTUBE IFRAME API
 * ===================================================
 */
function onYouTubeIframeAPIReady() {
    var iframeUrlPattern = 'https://www.youtube.com/embed/J1Ol6M0d9sg?enablejsapi=1&origin=chrome-extension%3A%2F%2F' + chrome.runtime.id;
    chrome.webRequest.onBeforeSendHeaders.addListener(function(info) {

        var refererRequestHeader;
        var referer = 'https://www.youtube.com/';

        info.requestHeaders.forEach(function(header) {
            if (header.name === 'Referer') {
                refererRequestHeader = header;
            }
        });

        if (typeof refererRequestHeader === 'undefined') {
            info.requestHeaders.push({
                name: 'Referer',
                value: referer
            });
        } else {
            refererRequestHeader.value = referer;
        }

        return { requestHeaders: info.requestHeaders };

    }, {
        urls: [iframeUrlPattern]
    }, ['blocking', 'requestHeaders']);


    youtubePlayer.player = new YT.Player('player', {
            height: '390',
            width: '640',
            videoId: 'J1Ol6M0d9sg',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
}

function onPlayerReady(event) {
  youtubePlayer.playerReady = true;
}

var youtubeProgressTimer;
function onPlayerStateChange(event) {

    clearTimeout(youtubeProgressTimer);

    switch(event.data) {
        case YT.PlayerState.PLAYING:
            youtubeProgressTimer = setInterval(function() {
                youtubePlayer.onTimeUpdate(youtubePlayer.player.getCurrentTime(), youtubePlayer.player.getDuration());
            }, 1000);
            break;

        case YT.PlayerState.ENDED:
            youtubePlayer.onEnded();
            break;

        case YT.PlayerState.PAUSED:
            //youtubePlayer.play();
            break;
        case YT.PlayerState.BUFFERING:
            break;
        case YT.PlayerState.CUED:
            break;
    }
}

function onPlayerError() {
    youtubePlayer.onError();
}

chrome.runtime.onConnect.addListener(function(port) {

    currentPort = port;

    port.onMessage.addListener(function(event) {

        var data = event.data;

        switch(event.message) {
            case 'scd.play':
                mainPlayer.play(data.track);
                break;
            case 'scd.resume':
                mainPlayer.resume();
                break;
            case 'scd.pause':
                mainPlayer.pause();
                break;
            case 'scd.next':
                mainPlayer.next();
                break;
            case 'scd.prev':
                mainPlayer.prev();
                break;
            case 'scd.clear':
                mainPlayer.clear();
                break;
            case 'scd.seek':
                mainPlayer.seek(data.xpos);
                break;
            case 'scd.volume':
                mainPlayer.setVolume(data.volume);
                break;
            case 'lastfm.authentication':
                window.LastFM.onAuthSuccess();
        }
    });

    currentPort.onDisconnect.addListener(function() {
        currentPort = null;
    })
});

//===========================
//GOOGLE ANALYTICS
//===========================
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-61308350-1', 'auto');
ga('set', 'checkProtocolTask', function(){});
ga('send', 'pageview');


