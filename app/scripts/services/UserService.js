(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("UserService", UserService);

    function UserService($rootScope, $http){

        var user;

        chrome.identity.getProfileUserInfo(function(info) {
            user = info;
            $rootScope.$broadcast('chrome.identity', {user: info});
        })

        return {
            getUser: getUser
        };

        function getUser() {
            return user;
        }
    };

}());
