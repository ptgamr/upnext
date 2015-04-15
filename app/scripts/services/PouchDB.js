(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Pouch", Pouch);

    function Pouch($rootScope, UserService){
        var localDb = new PouchDB('soundcloudify');
        var publicDb = new PouchDB('public');

        publicDb.put({
          _id: '_design/publicDesign',
          filters: {
            publicPlaylist: function (doc, req) {
              return doc.public === true;
            }.toString()
          }
        });

        $rootScope.$on('chrome.identity', function(event, data) {
            if (data.user.id) {
                console.log('start sync');
                localDb.sync('http://127.0.0.1:5984/usr' + data.user.id, {
                    live: true,
                    retry: true
                });
            }
        });

        $rootScope.$on('playlist.share', function(event, data) {
            console.log('share playlist');
            localDb.replicate.to(publicDb, {
                filter: function(doc) {
                    return doc.public === true;
                }
            });
        });

        return localDb;
    };

}());
