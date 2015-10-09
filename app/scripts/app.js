(function() {

    'use strict';

    var extension = angular.module('upnext', ['soundcloudify.core']);

    extension.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider, $compileProvider, $logProvider, $httpProvider, $indexedDBProvider, SCConfigurationProvider) {

            $stateProvider
                .state('nowPlaying', {
                    url: '/now-playing',
                    templateUrl: 'partials/nowPlaying.html',
                    controller: 'NowPlayingController',
                    controllerAs: 'vm'
                })
                .state('search', {
                    url: '/search',
                    templateUrl: 'partials/search.html',
                    controller: 'SearchController'
                })

                // PLAYLIST
                .state('playlist', {
                    abstract: true,
                    url: '/playlist',
                    templateUrl: 'partials/playlist/playlist.html',
                    controller: 'PlaylistController',
                    controllerAs: 'playlistCtrl'
                })
                    .state('playlist.list', {
                        url: '',
                        templateUrl: 'partials/playlist/list.html'
                    })
                    .state('playlist.view', {
                        url: '/:playlistIndex',
                        templateUrl: 'partials/playlist/view.html',
                        controller: 'PlaylistViewController',
                        controllerAs: 'playlistViewCtrl'
                    })

                // CHARTS
                .state('charts', {
                    abstract: true,
                    url: '/charts',
                    templateUrl: 'partials/charts/charts.html',
                    controller: 'ChartsController',
                    controllerAs: 'chartsCtrl'
                })
                    .state('charts.list', {
                        url: '',
                        templateUrl: 'partials/charts/list.html'
                    })
                    .state('charts.detail', {
                        url: '/:category',
                        templateUrl: 'partials/charts/view.html',
                        controller: 'ChartsViewController',
                        controllerAs: 'viewCtrl'
                    });

            $urlRouterProvider.otherwise('/charts');

            $mdThemingProvider.definePalette('dart', {
                '50': 'ffffff',
                '100': '999999',
                '200': '777777',
                '300': '555555',
                '400': '333333',
                '500': '000000',
                '600': '000000',
                '700': '000000',
                '800': '000000',
                '900': '000000',
                'A100': 'DDDDDD',
                'A200': 'CCCCCC',
                'A400': 'BBBBBB',
                'A700': '000000',
                'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                    // on this palette should be dark or light
                'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
                    '200', '300', '400', 'A100'],
                'contrastLightColors': undefined    // could also specify this if default was 'dark'
            });

            $mdThemingProvider.theme('default')
                .primaryPalette('light-green')
                .accentPalette('dart')
                .dark();

            $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);

            $httpProvider.interceptors.push('HttpRequestInterceptor');

            $indexedDBProvider
                .connection('soundcloudify')
                .upgradeDatabase(1, function(event, db, tx){
                    // console.log('upgradeDatabase');
                    // var playlistStore = db.createObjectStore('playlist', {keyPath: 'uuid'});
                    // var nowplayingStore = db.createObjectStore('nowplaying', {keyPath: 'uuid'});
                    // var starStore = db.createObjectStore('starred', {keyPath: 'id'});
                });

            //production stuffs
            $compileProvider.debugInfoEnabled(false);
            $logProvider.debugEnabled(false);

            SCConfigurationProvider.configureClient('ext');
        }
    );

    extension.run(function($rootScope, GATracker, $location, MigrationService, PlaylistService, StarService, UserService, SyncService) {
        $rootScope.$on('$stateChangeSuccess', function() {
            GATracker.trackPageView($location.path());
        });

        PlaylistService.init();

        StarService.init();

        UserService.init();

        SyncService.init();

        MigrationService.migrate();
    });

    angular.element(document).ready(function() {
        setTimeout(function() { angular.bootstrap(document, ['upnext']); }, 100);
    });

}());
