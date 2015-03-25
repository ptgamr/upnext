(function() {

	'use strict';

	window.ServiceHelpers = window.ServiceHelpers || {};

    window.ServiceHelpers.appendTransform = function appendTransform(defaults, transform) {

        // We can't guarantee that the default transformation is an array
        defaults = angular.isArray(defaults) ? defaults : [defaults];

        // Append the new transformation to the defaults
        return defaults.concat(transform);
    };

	var soundCloudify = angular.module('soundCloudify', ['ngMaterial', 'plangular', 'ngRoute', 'ui.router', 'react']);

	soundCloudify.value('CLIENT_ID', '849e84ac5f7843ce1cbc0e004ae4fb69');

	soundCloudify.config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider', '$compileProvider',
		function($stateProvider, $urlRouterProvider, $mdThemingProvider, $compileProvider) {

			$urlRouterProvider.otherwise("/home");

			$stateProvider
				.state('home', {
					url: "/home",
					templateUrl: "partials/home.html"
				});

			$mdThemingProvider.definePalette('amazingPaletteName', {
				'50': 'ffebee',
				'100': 'ffcdd2',
				'200': 'ef9a9a',
				'300': 'e57373',
				'400': 'ef5350',
				'500': 'f44336',
				'600': 'e53935',
				'700': 'd32f2f',
				'800': 'c62828',
				'900': 'b71c1c',
				'A100': 'ff8a80',
				'A200': 'ff5252',
				'A400': 'ff1744',
				'A700': 'd50000',
				'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
				                                	// on this palette should be dark or light
				'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
					'200', '300', '400', 'A100'],
				'contrastLightColors': undefined    // could also specify this if default was 'dark'
			});

			$mdThemingProvider.theme('default')
			    .primaryPalette('light-green').dark();

			$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);

			//TODO: reenable it in production
			//$compileProvider.debugInfoEnabled(false);
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
