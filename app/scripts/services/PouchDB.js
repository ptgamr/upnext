(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Pouch", Pouch);

    function Pouch($rootScope, UserService){
        var db = new PouchDB('soundcloudify');

        $rootScope.$on('chrome.identity', function(event, data) {
            if (data.user.id) {
                console.log('start sync');
                db.sync('http://127.0.0.1:5984/usr' + data.user.id, {
                    live: true,
                    retry: true
                });
            }
        })

        return db;
    };

}());
