(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("UserService", UserService);

    function UserService($rootScope, $http, API_ENDPOINT){
        var user = {
            id: '',
            email: ''
        };

        var gid = localStorage.getItem('gid');

        return {
            init: init,
            getUser: getUser
        };

        function init() {
            chrome.identity.getProfileUserInfo(function(info) {
                user.id = info.id;
                user.email = info.email;

                if (user.id && user.email) {
                    $rootScope.$broadcast('identity.confirm', {
                        identity: info
                    });

                    if (gid === null || gid === 'undefined') {
                        $http({
                            url: API_ENDPOINT + '/signup',
                            method: 'POST',
                            data: {
                                gid: user.id,
                                email: user.email
                            }
                        }).success(function(user) {
                            if (user.id) {
                                localStorage.setItem('gid', user.id);
                            }
                        });
                    }
                }

            });
        }

        function getUser() {
            return user;
        }
    };

}());
