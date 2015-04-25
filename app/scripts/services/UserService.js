(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("UserService", UserService);

    function UserService($rootScope, $http){
        var user = {
            id: '',
            email: ''
        };

        return {
            init: init,
            getUser: getUser
        };

        function init() {
            // chrome.identity.getProfileUserInfo(function(info) {
            //     user.id = info.id;
            //     user.email = info.email;

            //     if (user.id && user.email) {
            //         $rootScope.$broadcast('identity.confirm', {
            //             identity: info
            //         });
            //     }

            // });
        }

        function getUser() {
            return user;
        }
    };

}());
