this.currentTrack = false,
      this.playing = false,
      this.tracks = [],
      this.i = 0,
      this.playlistIndex = 0,
      this.data = {},
      this.currentTime = 0,
      this.duration = 0;

      this.load = function(track) {
        if(!track) {
          return;
        }
        this.tracks.push(track);
        if (!this.playing && !this.i) {
          this.currentTrack = this.tracks[0];
        }
      },

      this.play = function(index, playlistIndex) {
        this.i = index || 0;
        var track = this.tracks[this.i];
        if (track.tracks) {
          this.playlistIndex = playlistIndex || 0;
          this.playing = track.tracks[this.playlistIndex];
          var src = track.tracks[this.playlistIndex].stream_url + '?clientthis.id=' + clientId;
        } else {
          this.playing = track;
          var src = track.stream_url + '?clientthis.id=' + clientId;
        }
        this.currentTrack = this.playing;
        Messaging.sendPlayMessage(src);
      },

      this.pause = function() {
        Messaging.sendPauseMessage();
        this.playing = false;
      },

      this.playPause = function(i, playlistIndex) {
        var track = this.tracks[i];
        if (track.tracks && this.playing != track.tracks[playlistIndex]) {
          this.play(i, playlistIndex);
        } else if (!track.tracks && this.playing != track) {
          this.play(i);
        } else {
          this.pause();
        }
      },

      this.next = function() {
        var playlist = this.tracks[this.i].tracks || null;
        if (playlist && this.playlistIndex < playlist.length - 1) {
          this.playlistIndex++;
          this.play(this.i, this.playlistIndex);
        } else if (this.i < this.tracks.length - 1) {
          this.i++;
          // Handle advancing to new playlist
          if (this.tracks[this.i].tracks) {
            var playlist = this.tracks[this.i].tracks || null;
            this.playlistIndex = 0;
            this.play(this.i, this.playlistIndex);
          } else {
            this.play(this.i);
          }
        } else if (this.i >= this.tracks.length -1) {
          this.pause();
        }
      },

      this.previous = function() {
        var playlist = this.tracks[this.i].tracks || null;
        if (playlist && this.playlistIndex > 0) {
          this.playlistIndex--;
          this.play(this.i, this.playlistIndex);
        } else if (this.i > 0) {
          this.i--;
          if (this.tracks[this.i].tracks) {
            this.playlistIndex = this.tracks[this.i].tracks.length - 1;
            this.play(this.i, this.playlistIndex);
          } else {
            this.play(this.i);
          }
        }
      },


attrs.$observe('plangular', function(val) {

        if (!val) return;

        var src = val;
        var params = { url: src, clientthis.id: clientId, callback: 'JSON_CALLBACK' }

        if (src) {
          scope.index = index;
          index++;
        }

        function addKeys(track) {
          for (var key in track) {
            scope[key] = track[key];
          }
        }

        if (!src) {
          console.log('no src');
        } else if (player.data[src]) {
          scope.track = player.data[src];
          addKeys(scope.track);
        } else {
          $http.jsonp('https://api.soundcloud.com/resolve.json', { params: params }).success(function(data){
            if (data) {
              console.log(data);
              scope.track = data;
              addKeys(scope.track);
              player.data[src] = data;
              player.load(data, scope.index);
              player.play();
            }
          });
        }
      });

scope.play = function(playlistIndex) {
        player.play(scope.index, playlistIndex);
      };

      scope.pause = function() {
        player.pause();
      };

      scope.playPause = function(playlistIndex) {
        player.playPause(scope.index, playlistIndex);
      };

      scope.next = function() {
        player.next();
      };

      scope.previous = function() {
        player.previous();
      };

      scope.seek = function(e){
        if (player.tracks[player.i] == scope.track) {
          player.seek(e);
        }
      };

var player = {
 
    currentTrack: false,
    playing: false,
    tracks: [],
    i: 0,
    playlistIndex: 0,
    data: {},
    currentTime: 0,
    duration: 0,

    load: function(track, index) {
      this.tracks[index] = track;
      if (!this.playing && !this.i && index == 0) {
        this.currentTrack = this.tracks[0];
      }
    },

    play: function(index, playlistIndex) {
      this.i = index || 0;
      var track = this.tracks[this.i];
      console.log("Play " + this.i);
      console.log(track);
      console.log("#################");
      if (track.tracks) {
        this.playlistIndex = playlistIndex || 0;
        this.playing = track.tracks[this.playlistIndex];
        var src = track.tracks[this.playlistIndex].stream_url + '?client_id=' + clientId;
      } else {
        this.playing = track;
        var src = track.stream_url + '?client_id=' + clientId;
      }
      this.currentTrack = this.playing;
      Messaging.sendPlayMessage(src);
    },

    pause: function() {
      Messaging.sendPauseMessage();
      this.playing = false;
    },

    playPause: function(i, playlistIndex) {
      var track = this.tracks[i];
      if (track.tracks && this.playing != track.tracks[playlistIndex]) {
        this.play(i, playlistIndex);
      } else if (!track.tracks && this.playing != track) {
        this.play(i);
      } else {
        this.pause();
      }
    },

    next: function() {
      var playlist = this.tracks[this.i].tracks || null;
      if (playlist && this.playlistIndex < playlist.length - 1) {
        this.playlistIndex++;
        this.play(this.i, this.playlistIndex);
      } else if (this.i < this.tracks.length - 1) {
        this.i++;
        // Handle advancing to new playlist
        if (this.tracks[this.i].tracks) {
          var playlist = this.tracks[this.i].tracks || null;
          this.playlistIndex = 0;
          this.play(this.i, this.playlistIndex);
        } else {
          this.play(this.i);
        }
      } else if (this.i >= this.tracks.length -1) {
        this.pause();
      }
    },

    previous: function() {
      var playlist = this.tracks[this.i].tracks || null;
      if (playlist && this.playlistIndex > 0) {
        this.playlistIndex--;
        this.play(this.i, this.playlistIndex);
      } else if (this.i > 0) {
        this.i--;
        if (this.tracks[this.i].tracks) {
          this.playlistIndex = this.tracks[this.i].tracks.length - 1;
          this.play(this.i, this.playlistIndex);
        } else {
          this.play(this.i);
        }
      }
    },

    seek: function(e) {
      var xpos = e.offsetX / e.target.offsetWidth;
      Messaging.sendSeekMessage(xpos);
    }

  };