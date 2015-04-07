(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("LastFMAuthentication", LastFMAuthentication);

    function LastFMAuthentication($http, Messaging){

        var API_URL = 'https://ws.audioscrobbler.com/2.0/',
            API_KEY = '270d7aec2d7de22c88d90f36c66c9a1a',
            API_SECRET = 'c8a7d4cbfba61e6b777220878bfa8cc1';

        var _sessionKey = localStorage.getItem('lastfm.sessionKey'),
            _token = localStorage.getItem('lastfm.token');

        return {
            auth: auth,
            isAuth: isAuth
        };

        function auth(onAuthenticationSuccess) {

            //in the process of auth, continue to fetch the sessionKey
            if (_token) {

                var params = {
                    api_key: API_KEY,
                    token: _token,
                    method: 'auth.getSession',
                    format: 'json'
                };

                params.api_sig = _createSignature(params);

                $http({
                    url: API_URL,
                    method: 'GET',
                    params: params
                }).success(function(data) {
                    if (data.session && data.session.key) {
                        console.log('session key: ' + data.session.key);
                        _sessionKey = data.session.key;
                        _token = '';
                        localStorage.setItem('lastfm.sessionKey', data.session.key);
                        localStorage.setItem('lastfm.token', '');

                        Messaging.sendLastFmAuthenticationMessage();

                        if (onAuthenticationSuccess) onAuthenticationSuccess.apply();
                    } else {
                        if (data.error === 4) { //Invalid authentication token supplied
                            _requestToken();            
                        } else if (data.error = 14) { //This token has not been authorized
                            _openLastFmAuthentication(_token);
                        }
                    }
                }).error(function() {
                    console.log('LastFMAuthentication._requestToken: error');
                });

            } else {
                _requestToken();
            }
        }

        function isAuth() {
            return !!_sessionKey;
        }

        function _requestToken() {

            var params = {
                method: 'auth.getToken',
                api_key: API_KEY,
                format: 'json'
            };

            $http({
                url: API_URL,
                method: 'GET',
                params: params
            }).success(function(data) {
                if (data.token) {
                    console.log('token: ' + data.token);
                    localStorage.setItem('lastfm.token', data.token);
                    _token = data.token;
                    _openLastFmAuthentication(data.token);
                } else {
                    console.log('LastFM.auth: no token key found');
                }
            }).error(function() {
                console.log('LastFMAuthentication._requestToken: error');
            });
        }

        function _openLastFmAuthentication(token) {
            //open the last.fm auth page
            var authUrl = 'https://www.last.fm/api/auth/?api_key=' + API_KEY + '&token=' + token;
            chrome.tabs.create({active: true, url: authUrl});
        }

        function _createSignature(params) {

            var keys = [];
            var o = '';

            for (var x in params) {
                if (params.hasOwnProperty(x)) {
                    keys.push(x);
                }
            }

            // params has to be ordered alphabetically
            keys.sort();

            for (var i = 0; i < keys.length; i++) {
                if (keys[i] == 'format' || keys[i] == 'callback') {
                    continue;
                }

                o = o + keys[i] + params[keys[i]];
            }

            // append secret
            return md5(o + API_SECRET);

        }

    };

}());
