(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("UserService", UserService);

    function UserService($rootScope, $http){
        var user = {
            id: '',
            email: ''
        };

        chrome.identity.getProfileUserInfo(function(info) {
            user.id = info.id;
            user.email = info.email;

            $rootScope.$broadcast('identity.confirm', {
                identity: info
            });
        });
        
        return {
            getUser: getUser
        };

        function getUser() {
            return user;
        }
    };

}());
