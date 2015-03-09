(function() {

	'use strict';

	var soundCloudify = angular.module('soundCloudify', ['ngMaterial', 'plangular', 'ngRoute']);

	soundCloudify.value('CLIENT_ID', '849e84ac5f7843ce1cbc0e004ae4fb69');

	soundCloudify.config(['$routeProvider', '$mdThemingProvider', '$compileProvider',
		function($routeProvider, $mdThemingProvider, $compileProvider) {
			$routeProvider.
				when('/', {
					templateUrl: 'partials/home.html',
					controller: 'MainController as ctrl'
				}).
				when('/playlist/:category', {
					templateUrl: 'partials/playlist.html',
					controller: 'PlaylistController as ctrl'
				}).
				otherwise({
					redirectTo: '/'
				});

			$mdThemingProvider.theme('default')
			    .primaryPalette('indigo');

			$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
		}
	]);

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
}());
