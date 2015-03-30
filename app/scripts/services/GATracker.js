(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("GATracker", GoogleAnalyticService);

    function GoogleAnalyticService($window){
        return {
            trackPageView: trackPageView,
            trackSearch: trackSearch,
            trackDiscovery: trackDiscovery,
            trackPlayer: trackPlayer,
            trackCustomEvent: trackCustomEvent
        };

        function trackPageView(url) {
            if (!$window.ga || !url) {
                return;
            }
            $window.ga('send', 'pageview', { page: url });
        }

        function trackSearch(action, label, value) {
            if (!$window.ga) {
                return;
            }
            $window.ga('send', 'event', 'search', action, label, value);
        }

        function trackDiscovery(action, label, value) {
            if (!$window.ga) {
                return;
            }
            $window.ga('send', 'event', 'discovery', action, label, value);
        }

        function trackPlayer(action, label, value) {
            if (!$window.ga) {
                return;
            }
            $window.ga('send', 'event', 'player', action, label, value);
        }

        function trackCustomEvent(category, action, label, value) {
            if (!$window.ga) {
                return;
            }
            $window.ga('send', 'event', category, action, label, value);   
        }
    };

}());
