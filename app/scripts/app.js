(function() {

	'use strict';
	
	var soundCloudify = angular.module('soundCloudify', []);

	soundCloudify.value('CLIENT_ID', '849e84ac5f7843ce1cbc0e004ae4fb69');

	soundCloudify.service('SoundCloudService', function($http, CLIENT_ID) {

		var getTrack = function() {
			return $http.get('http://api.soundcloud.com/tracks/13158665.json?client_id=' + CLIENT_ID);
		};

		return {
			getTrack: getTrack
		};

	});

	soundCloudify.controller('MainController', function(SoundCloudService, CLIENT_ID) {

		var self = this;

		this.getTrack = function() {
			SoundCloudService.getTrack().success(function(track) {
				self.track = track;

				console.log("Start Playing");
				soundManager.createSound({
					id: 'mySound',
					url: track.stream_url + '?client_id=' + CLIENT_ID,
					autoLoad: true,
					autoPlay: true,
					onload: function() {
						console.log('The sound '+this.id+' loaded!');
					},
					volume: 50
				});
			});
		};

	});


}());