(function() {

	'use strict';

	window.ServiceHelpers = window.ServiceHelpers || {};

    window.ServiceHelpers.appendTransform = function appendTransform(defaults, transform) {

        // We can't guarantee that the default transformation is an array
        defaults = angular.isArray(defaults) ? defaults : [defaults];

        // Append the new transformation to the defaults
        return defaults.concat(transform);
    };

	var soundCloudify = angular.module('soundCloudify', ['ngMaterial', 'plangular', 'ngRoute', 'ui.router']);

	soundCloudify.value('CLIENT_ID', '849e84ac5f7843ce1cbc0e004ae4fb69');

	soundCloudify.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$compileProvider',
		function($stateProvider, $urlRouterProvider, $mdThemingProvider, $compileProvider) {

			$urlRouterProvider.otherwise("/home");

			$stateProvider
				.state('home', {
					url: "/home",
					templateUrl: "partials/home.html"
				});

			$mdThemingProvider.theme('default')
			    .primaryPalette('deep-orange');

			// $mdThemingProvider.theme('docs-dark', 'default')
		 //        .primaryPalette('yellow')
		 //        .dark();

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
