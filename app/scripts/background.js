'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

/**
 * Notification show only one if we don't change the priority
 * http://stackoverflow.com/questions/26350747/chrome-notifications-update-or-create/26358154#26358154
 */
var Utils = {
    createOrUpdateNotification: function(id, options, callback) {
      // Try to lower priority to minimal "shown" priority
      chrome.notifications.update(id, {priority: 0}, function(existed) {
        if(existed) {
          console.log("notification existed, update priority");
          var targetPriority = options.priority || 0;
          options.priority = 1;
          // Update with higher priority
          chrome.notifications.update(id, options, function() {
            console.log("notification shown");
            console.log(options);
            callback(true);
            // chrome.notifications.update(id, {priority: targetPriority}, function() {
            //   callback(true); // Updated
            // });
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
var currentPort;
var Player = function() {
    this.audio = document.createElement('audio');
    this.audio.volume = 0.5;
    this.init();
};

Player.prototype = {
    constructor: Player,

    init: function() {

        var self = this;

        self.tracks = [];
        self.state = {};
        self.notificationId = '';

        this.audio.addEventListener('timeupdate', function() {
            if (!currentPort) return;
            currentPort.postMessage({message: 'scd.timeupdate', data: {
                currentTime: self.audio.currentTime,
                duration: self.audio.duration
            }});
        }, false);

        this.audio.addEventListener('ended', function() {

            if (self.state.repeat === 0) {
                //do-nothing
            } else if (self.state.repeat === 1) {
                self.next.call(self);
            } else {
                self.replay();
            }

        }, false);


        chrome.storage.local.get('nowPlaying', function(data) {
            self.tracks = data['nowPlaying'] || [];
        });

        chrome.storage.local.get('nowPlayingState', function(data) {
            self.state = data['nowPlayingState'] || {};
        });

        chrome.storage.onChanged.addListener(function (changes, areaName) {

            if (changes['nowPlaying']) {
                self.tracks = changes['nowPlaying'].newValue;

                if(!self.tracks.length) {
                    self.clear.call(self);
                }
            }

            if (changes['nowPlayingState']) {

                var oldValue = changes['nowPlayingState'].oldValue,
                    lastTrackId = oldValue ?  oldValue.currentTrack.id : null;

                self.state = changes['nowPlayingState'].newValue;

                if (lastTrackId !== self.state.currentTrack.id) {
                    var notificationOptions = {
                        type: "basic",
                        title: "Playing Track",
                        message: self.state.currentTrack.title,
                        iconUrl: self.state.currentTrack.artworkUrl
                    };
                    Utils.createOrUpdateNotification('track-change', notificationOptions, function() {});
                }
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
            this.play(nextTrack.streamUrl + '?client_id=' + CLIENT_ID);

            this.state.currentIndex = nextIndex;
            this.state.currentTrack = nextTrack;
            this.state.playing = true;

            if (currentPort) {
                currentPort.postMessage({message: 'scd.trackChangedFromBackground', data: this.state});
            }

            chrome.storage.local.set({'nowPlayingState': this.state});
        }
    },

    prev: function() {
        var currentIndex = this.state.currentIndex;
        var nextIndex = currentIndex - 1;

        if (nextIndex < 0) {
            nextIndex = this.tracks.length -1;
        }

        var nextTrack = this.tracks[nextIndex];

        if (nextTrack) {
            this.play(nextTrack.streamUrl + '?client_id=' + CLIENT_ID);
            this.state.currentIndex = nextIndex;
            this.state.currentTrack = nextTrack;
            this.state.playing = true;
            if (currentPort) {
                currentPort.postMessage({message: 'scd.trackChangedFromBackground', data: this.state});
            }
            chrome.storage.local.set({'nowPlayingState': this.state});
        }
    },

    play: function(src) {
        if (src && src !== this.audio.src) {
            this.audio.src = src;
        }
        
        if (!this.audio.src && this.state.currentTrack) {
            this.audio.src = this.state.currentTrack.streamUrl + '?client_id=' + CLIENT_ID;
        }

        this.audio.play();
    },

    pause: function() {
        this.audio.pause();
    },

    replay: function() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.play();
    },

    clear: function() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = null;
    },

    seek: function(xpos) {
        if (!this.audio.readyState) return false;
        this.audio.currentTime = (xpos * this.audio.duration);
    },

    setVolume: function(volume) {
        console.log('set volume ' + volume);
        this.audio.volume = volume;
    }
};

var youtubePlayer, youtubePlayerReady = false;
var soundcloudPlayer = new Player();

chrome.runtime.onConnect.addListener(function(port) {

    currentPort = port;

    chrome.browserAction.setBadgeText({text: 'C'});

    port.onMessage.addListener(function(event) {

        var data = event.data;

        switch(event.message) {
            case 'scd.play':
                var track = data.track;

                if (track.origin === 'yt') {
                    console.log(track);
                    soundcloudPlayer.clear();
                    youtubePlayer.loadVideoById({videoId: track.id});

                } else {
                    youtubePlayer.stopVideo();
                    var streamUrl = track.streamUrl + '?client_id=' + CLIENT_ID;
                    soundcloudPlayer.play(streamUrl);
                }

                break;
            case 'scd.pause':
                soundcloudPlayer.pause();
                break;
            case 'scd.next':
                soundcloudPlayer.next();
                break;
            case 'scd.prev':
                soundcloudPlayer.prev();
                break;
            case 'scd.seek':
                soundcloudPlayer.seek(data.xpos);
                break;
            case 'scd.volume':
                soundcloudPlayer.setVolume(data.volume);
                break;
        }
    });

    currentPort.onDisconnect.addListener(function() {
        currentPort = null;
    })
});

/**
 * ===================================================
 *                YOUTUBE PLAYER
 * ===================================================
 */
// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
function onYouTubeIframeAPIReady() {
  console.log('onYouTubeIframeAPIReady')
  youtubePlayer = new YT.Player('player', {
    height: '390',
    width: '640',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  console.log('onPlayerReady');
  youtubePlayer.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
var youtubeProgressTimer;
function onPlayerStateChange(event) {

    clearTimeout(youtubeProgressTimer);

    switch(event.data) {
        case YT.PlayerState.PLAYING:
            youtubeProgressTimer = setInterval(function() {
                console.log('playing');
                if (currentPort) {
                    currentPort.postMessage({message: 'scd.timeupdate', data: {
                        currentTime: youtubePlayer.getCurrentTime(),
                        duration: youtubePlayer.getDuration()
                    }});
                }
            }, 1000);
            break;
        case YT.PlayerState.ENDED:
            break;
        case YT.PlayerState.PAUSED:
            break;
        case YT.PlayerState.BUFFERING:
            break;
        case YT.PlayerState.CUED:
            break;
    }


  if (event.data == YT.PlayerState.PLAYING && !done) {
    setTimeout(stopVideo, 6000);
    done = true;
  }
}

function stopVideo() {
};



