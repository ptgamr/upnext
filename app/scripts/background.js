'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

//chrome.browserAction.setBadgeText({text: '\'Allo'});

//console.log('\'Allo \'Allo! Event Page for Browser Action');

var Player = function() {
    this.audio = document.createElement('audio');
    this.init();
};

Player.prototype = {
    constructor: Player,

    init: function() {

        this.audio.addEventListener('timeupdate', function() {
            port.postMessage({message: 'scd.timeupdate', data: {
                currentTime: audio.currentTime,
                duration: audio.duration
            }});
        }, false);

        this.audio.addEventListener('ended', function() {
            port.postMessage({message: 'scd.ended', data: {}});
        }, false);
    },

    play: function(src) {
        if (src !== this.audio.src) {
            this.audio.src = src;
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
});