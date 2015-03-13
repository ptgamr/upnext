/*

        PLANGULAR
        A Highly Customizable SoundCloud Player

        Angular Version

        http://jxnblk.github.io/Plangular

 */

(function() {

'use strict';

var plangular = angular.module('plangular', []);

plangular.directive('corePlayer', function(Messaging, NowPlaying, CLIENT_ID) {
  return {
    restrict: 'EA',
    controller: function() {

      var self = this;
      this.tracks = [];

      this.state = {
        currentTrack: false,
        currentIndex: 0,
        playing: false,
        currentTime: 0,
        duration: 0
      };

      NowPlaying.getList(function(tracks) {
        self.tracks = tracks;
      });

      NowPlaying.getState(function(savedState) {
        self.state = savedState;
      })

      this.add = function(track, andPlay) {

        if (track) {
          this.tracks.push(track);
        }

        if (andPlay) {
          this.play(this.tracks.length - 1);
        }

        NowPlaying.saveList(this.tracks);

      };

      this.remove = function(index) {
        this.tracks.splice(index, 1);

        if (this.state.currentIndex === index) {
          this.play(index);
        } else if (index < this.state.currentIndex){
          this.state.currentIndex --;
        }
      };

      this.play = function(index) {

        index = index || 0;

        var track = this.tracks[index];

        if (!track) {
          throw 'No track found for playing, index=' + index;
        }

        if (track) {
          var src = track.stream_url + '?client_id=' + CLIENT_ID;
          this.state.playing = true;
          this.state.currentTrack = track;
          this.state.currentIndex = index;
          NowPlaying.saveState(this.state);
          Messaging.sendPlayMessage(src);
        }
      };

      this.pause = function() {
        this.state.playing = false;
        NowPlaying.saveState(this.state);
        Messaging.sendPauseMessage();
      };

      this.resume = function() {
        if(!this.state.currentTrack) {
          this.play();
          return;
        }

        this.state.playing = true;
        NowPlaying.saveState(this.state);
        Messaging.sendPlayMessage();
      }

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
        var nextIndex = this.state.currentIndex + 1;
        if (nextIndex >= this.tracks.length) {
          nextIndex = 0;
        }
        this.play(nextIndex);
      };

      this.previous = function() {
        var nextIndex = this.state.currentIndex - 1;
        if (nextIndex < 0) {
          nextIndex = this.track.length - 1;
        }
        this.play(nextIndex);
      };

      this.seek = function(e) {
        var xpos = e.offsetX / e.target.offsetWidth;
        Messaging.sendSeekMessage(xpos);
      };

      this.updateState = function(data) {
        if(!this.state.currentTrack) {
          this.state.currentTrack = data.track;
          this.state.playing = true;
        }

        this.state.currentTime = data.currentTime;
        this.state.duration = data.duration;
      }
    }
  };
});

plangular.directive('plangular', ['$http', '$rootScope', 'plangularConfig', 'Messaging', function ($http, $rootScope, plangularConfig, Messaging) {
  
  var CLIENT_ID = plangularConfig.clientId;

  return {

    restrict: 'A',
    scope: true,
    require: '^corePlayer',
    link: function (scope, elem, attrs, playerController) {

      scope.player = playerController;

      Messaging.registerTimeUpdateHandler(function(data) {
        $rootScope.$apply(function () {
          playerController.updateState.call(playerController, data);
        });
      });

      // Messaging.registerEndedHandler(function() {
      //   $rootScope.$apply(function () {
      //     if (playerController.tracks.length > 0) playerController.next.call(playerController);
      //     else playerController.pause.call(playerController);
      //   });
      // });
    }

  }

}]);


// Plangular Icons
plangular.directive('plangularIcon', function() {

  var sprite = {
    play: 'M0 0 L32 16 L0 32 z',
    pause: 'M0 0 H12 V32 H0 z M20 0 H32 V32 H20 z',
    previous: 'M0 0 H4 V14 L32 0 V32 L4 18 V32 H0 z',
    next: 'M0 0 L28 14 V0 H32 V32 H28 V18 L0 32 z',
    close: 'M4 8 L8 4 L16 12 L24 4 L28 8 L20 16 L28 24 L24 28 L16 20 L8 28 L4 24 L12 16 z',
    chevronRight: 'M12 1 L26 16 L12 31 L8 27 L18 16 L8 5 z',
    chevronLeft: 'M20 1 L24 5 L14 16 L24 27 L20 31 L6 16 z',
    heart: 'M0 10 C0 6, 3 2, 8 2 C12 2, 15 5, 16 6 C17 5, 20 2, 24 2 C30 2, 32 6, 32 10 C32 18, 18 29, 16 30 C14 29, 0 18, 0 10'
  };

  return {

    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs) {

      var el = elem[0],
          id = attrs.plangularIcon,
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      if (!sprite[id]) {
        var availableIcons = '';
        for (var key in sprite) {
          availableIcons += key + ', ';
        };
        console.error(
          'No icon found for ' + id + '.\n\n' +
          'Icons available:\n'+
          availableIcons + '\n\n' +
          'More icons available from http://jxnblk.github.io/geomicons-open'
        );
        return false;
      }

      el.classList.add('plangular-icon', 'plangular-icon-'+id);
      el.setAttribute('viewBox', '0 0 32 32');
      el.setAttribute('style', 'max-height:100%');
      el.setAttribute('fill', 'currentColor');
      path.setAttribute('d', sprite[id]);
      el.appendChild(path);
 
    }

  }

});


// Filter to convert milliseconds to hours, minutes, seconds
plangular.filter('prettyTime', function() {
  return function(value) {
    var hours = Math.floor(value / 3600),
        mins = '0' + Math.floor((value % 3600) / 60),
        secs = '0' + Math.floor((value % 60));
        mins = mins.substr(mins.length - 2);
        secs = secs.substr(secs.length - 2);
    if(!isNaN(secs)){
      if (hours){
        return hours+':'+mins+':'+secs;  
      } else {
        return mins+':'+secs;  
      };
    } else {
      return '00:00';
    };
  };
});

// Filter to convert milliseconds to hours, minutes, seconds
plangular.filter('scArtwork', function() {
  return function(value) {
    return value ? value.replace('-large.', '-t250x250.') : '';
  };
});

plangular.provider('plangularConfig', function() {
  this.clientId = '849e84ac5f7843ce1cbc0e004ae4fb69';
  var _this = this;
  this.$get = function() {
    return {
      clientId: _this.clientId
    };
  };
});

plangular.factory("Messaging", function() {
  var onTimeUpdate, onEnded;

  var port = chrome.runtime.connect({name: "soundcloudify"});

  port.onMessage.addListener(function(event) {
    var data = event.data;

    switch(event.message) {
      case 'scd.timeupdate':
        if(onTimeUpdate)
          onTimeUpdate(data);
        break;
      case 'scd.ended':
        if(onEnded)
          onEnded(data);
        break;
    }
  });
    
  return {
      registerTimeUpdateHandler: registerTimeUpdateHandler,
      registerEndedHandler: registerEndedHandler,
      sendPlayMessage: sendPlayMessage,
      sendPauseMessage: sendPauseMessage,
      sendSeekMessage: sendSeekMessage
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
});

})();


