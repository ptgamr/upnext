(function() {

    angular.module('soundCloudify')
            .filter('translate', translateFilter);

    function translateFilter() {
        return function(key) {
            return chrome.i18n.getMessage(key);
        };
    }
}());