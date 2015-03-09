'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

//chrome.browserAction.setBadgeText({text: '\'Allo'});

//console.log('\'Allo \'Allo! Event Page for Browser Action');

var CLIENT_ID = '849e84ac5f7843ce1cbc0e004ae4fb69';
var currentPort;
var Player = function() {
    this.audio = document.createElement('audio');
    this.init();
};

Player.prototype = {
    constructor: Player,

    init: function() {

        var self = this;

        self.tracks = [];
        self.state = {};

        this.audio.addEventListener('timeupdate', function() {
            if (!currentPort) return;
            currentPort.postMessage({message: 'scd.timeupdate', data: {
                currentTime: self.audio.currentTime,
                duration: self.audio.duration
            }});
        }, false);

        this.audio.addEventListener('ended', function() {
            selft.next.call(self);
        }, false);


        chrome.storage.local.get('nowPlaying', function(data) {
            console.log("getNowPlaying");
            self.tracks = data['nowPlaying'] || [];
        });

        chrome.storage.local.get('nowPlayingState', function(data) {
            self.state = data['nowPlayingState'] || {};
        });

        chrome.storage.onChanged.addListener(function (changes, areaName) {
            if (changes['nowPlaying']) {
                self.tracks = changes['nowPlaying'].newValue;
            }

            if (changes['nowPlayingState']) {
                self.state = changes['nowPlayingState'].newValue;
            }
        });

    },

    next: function() {
        var currentIndex = this.state.currentIndex;
        nextIndex = currentIndex + 1;

        if (nextIndex > this.tracks.length) {
            nextIndex = 0;
        }

        var nextTrack = this.tracks[nextIndex];

        if (nextTrack) {
            this.play(nextTrack.stream_url + '?client_id=' + CLIENT_ID);
            var newState = {
                currentIndex: nextIndex,
                currentTrack: nextTrack,
                playing: true   
            }
            chrome.storage.local.set({'nowPlayingState': newState});
        }
    },

    play: function(src) {
        if (src && src !== this.audio.src) {
            this.audio.src = src;
        }
        
        if (!this.audio.src && this.state.currentTrack) {
            this.audio.src = this.state.currentTrack.stream_url + '?client_id=' + CLIENT_ID;
        }

        this.audio.play();
    },

    pause: function() {
        this.audio.pause();
    },

    seek: function(xpos) {
        if (!this.audio.readyState) return false;
        this.audio.currentTime = (xpos * this.audio.duration);
    }
};

var backgroundPlayer = new Player();

chrome.runtime.onConnect.addListener(function(port) {

    currentPort = port;

    chrome.browserAction.setBadgeText({text: 'C'});

    port.onMessage.addListener(function(event) {

        var data = event.data;

        switch(event.message) {
            case 'scd.play':
                backgroundPlayer.play(data.src);
                break;
            case 'scd.pause':
                backgroundPlayer.pause();
                break;
            case 'scd.seek':
                backgroundPlayer.seek(data.xpos);
                break;
        }
    });

    currentPort.onDisconnect.addListener(function() {
        currentPort = null;
    })
});