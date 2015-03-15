
(function(){
    'use strict';

    angular.module('soundCloudify')
        .factory("Messaging", MessagingService);

    function MessagingService(){

      var onTimeUpdate, onEnded;

      var port = chrome.runtime.connect({name: "soundcloudify"});

      port.onMessage.addListener(function(event) {
        var data = event.data;

        switch(event.message) {
          case 'scd.timeupdate':
            console.log('scd.timeupdate')
            onTimeUpdate(data);
            break;
          case 'scd.ended':
            onEnded(data);
            break;
        }
      });
        
      return {
          registerTimeUpdateHandler: registerTimeUpdateHandler,
          registerEndedHandler: registerEndedHandler,
          sendPlayMessage: sendPlayMessage,
          sendPauseMessage: sendPauseMessage,
          sendSeekMessage: sendSeekMessage,
          sendVolumeMessage: sendVolumeMessage
      };

      function registerTimeUpdateHandler(callback) {
        onTimeUpdate = callback;
      }

      function registerEndedHandler(callback) {
        onEnded = callback;
      }

      function sendPlayMessage(src) {
        port.postMessage({message: 'scd.play', data: {
            src: src
        }});
      }

      function sendPauseMessage() {
        port.postMessage({message: 'scd.pause', data: {}});
      }

      function sendSeekMessage(xpos) {
        port.postMessage({message: 'scd.seek', data: {
            xpos: xpos
        }});
      }

      function sendVolumeMessage(volume) {
        port.postMessage({message: 'scd.volume', data: {
            volume: volume
        }});
      }
    };

}());