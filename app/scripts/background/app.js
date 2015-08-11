(function() {
    'use strict';

    window.ServiceHelpers = window.ServiceHelpers || {};

    window.ServiceHelpers.appendTransform = function appendTransform(defaults, transform) {

        // We can't guarantee that the default transformation is an array
        defaults = angular.isArray(defaults) ? defaults : [defaults];

        // Append the new transformation to the defaults
        return defaults.concat(transform);
    };

    window.ServiceHelpers.ID = function() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    var background = angular.module('soundcloudify.background', ['ngMaterial', 'indexedDB']);

    background.config(function($indexedDBProvider) {
            $indexedDBProvider
                .connection('soundcloudify')
                .upgradeDatabase(1, function(event, db, tx){
                    // console.log('upgradeDatabase');
                    // var playlistStore = db.createObjectStore('playlist', {keyPath: 'uuid'});
                    // var nowplayingStore = db.createObjectStore('nowplaying', {keyPath: 'uuid'});
                    // var starStore = db.createObjectStore('starred', {keyPath: 'id'});
                });
        })


    background.value('API_ENDPOINT', 'http://api.getsoundcloudify.com');

    //SoundCloud API key
    background.value('CLIENT_ID', '458dac111e2456c40805cd838f4548c1');

    //YouTube API key
    background.value('YOUTUBE_KEY', 'AIzaSyDGbUJxAkFnaJqlTD4NwDmzWxXAk55gFh4');


}());
