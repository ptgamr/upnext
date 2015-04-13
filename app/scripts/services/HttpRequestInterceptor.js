(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("HttpRequestInterceptor", HttpRequestInterceptor);

    function HttpRequestInterceptor($injector){

        return {
            request: function($config) {

                if($config.url.indexOf('http://localhost') === 0) {
                    var UserService = $injector.get("UserService");
                    var user = UserService.getUser();
                    if (user) {
                        $config.headers['uid'] = user.id;
                    }
                }

                return $config;
            }
        };
    };

}());
