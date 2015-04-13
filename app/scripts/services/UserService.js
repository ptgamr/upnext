(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("UserService", UserService);

    function UserService($http){
        var user = {
            id: '123456',
            email: 'anh.trinhtrung@gmail.com'
        };
        
        return {
            getUser: getUser
        };

        function getUser() {
            return user;
        }
    };

}());
