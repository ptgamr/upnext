(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Pouch", Pouch);

    function Pouch($rootScope, UserService){
        var localDb = new PouchDB('soundcloudify');
        //var localPublicDb = new PouchDB('public');
        var remotePublicDb = new PouchDB('http://127.0.0.1:5984/public');

        $rootScope.$on('chrome.identity', function(event, data) {
            if (data.user.id) {
                console.log('start sync');
                localDb.sync('http://127.0.0.1:5984/usr' + data.user.id, {
                    live: true,
                    retry: true
                });
                // remotePublicDb.replicate.to(localPublicDb, {
                //     filter: 'app/by_user',
                //     query_params: { "user": data.user.id }
                // });
            }
        });

        $rootScope.$on('playlist.share', function(event, data) {
            console.log('share playlist');
            localDb.replicate.to(remotePublicDb, {
                filter: function(doc) {
                    return doc.type === 'playlist' && doc.public === true;
                }
            });
        });

        return localDb;
    };

}());
