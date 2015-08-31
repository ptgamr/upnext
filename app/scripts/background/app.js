(function() {
    'use strict';

    var background = angular.module('soundcloudify.background', ['soundcloudify.core', 'indexedDB']);

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
    .run(function(ContextMenuService, PlaylistService) {
        PlaylistService.init();
        ContextMenuService.init();
    });

    angular.element(document).ready(function() {
        setTimeout(function() { angular.bootstrap(document, ["soundcloudify.background"]); }, 100);
    });
}());
