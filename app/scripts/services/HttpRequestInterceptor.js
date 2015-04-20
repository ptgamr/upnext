(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("HttpRequestInterceptor", HttpRequestInterceptor);

    function HttpRequestInterceptor($injector){

        var $rootScope = $injector.get('$rootScope'), _user;

        $rootScope.$on('identity.confirm', function(event, data) {
            if (data.identity.id && data.identity.email) {
                _user = data.identity;
            }
        });

        return {
            request: function($config) {

                if (!user) return;

                if($config.url.indexOf('http://localhost') === 0) {
                    $config.headers['uid'] = user.id;
                }
                return $config;
            }
        };
    };

}());
