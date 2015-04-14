(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("Pouch", Pouch);

    function Pouch(){
        var db = new PouchDB('soundcloudify');
        return db;
    };

}());
