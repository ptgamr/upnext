(function() {

	'use strict';

	var soundCloudify = angular.module('soundCloudify', ['plangular']);

	soundCloudify.value('CLIENT_ID', '849e84ac5f7843ce1cbc0e004ae4fb69');

	soundCloudify.service('SoundCloudService', function($http, CLIENT_ID) {

		var getTracks = function() {
			return $http.get('https://api.soundcloud.com/tracks?client_id=' + CLIENT_ID);
		};

		var getTrack = function() {
			return $http.get('https://api.soundcloud.com/tracks/13158665.json?client_id=' + CLIENT_ID);
		};

		return {
			getTrack: getTrack,
			getTracks: getTracks
		};

	});

	soundCloudify.service('SDK', function($q, CLIENT_ID) {
		var play = function() {
			
		};

		var getTracks = function() {
		};

		return {
			play: play,
			getTracks: getTracks
		}

	});

	soundCloudify.controller('MainController', function(SDK, CLIENT_ID) {

		// var self = this;

		// this.getTracks = function() {
		// 	SDK.getTracks().then(function(tracks) {
		// 		self.tracks = tracks;
		// 	});
		// };

		// this.getTracks();
	});

}());
