(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("SuggestionService", SuggestionService);

    function SuggestionService($http, CLIENT_ID, TrackAdapter, $q){
        
        return {
            suggest: youtubeSuggest
        };

        function youtubeSuggest(term) {

            var params = { q: term, client: 'firefox', ds: 'yt'};

            return $q(function(resolve, reject) {
                $http({
                    url: 'http://suggestqueries.google.com/complete/search',
                    method: 'GET',
                    params: params,
                    transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                        console.log(result);
                        if (!result || !result[1]) return [];


                        return result[1].map(function(suggestion) {
                            return {
                                value: suggestion,
                                display: suggestion
                            };
                        })
                    })
                }).success(function(data) {
                    resolve(data)
                }).error(function() {
                    reject();
                });
            });
        }

        function suggest(term){
            var params = { q: term, limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };

            return $q(function(resolve, reject) {
                $http({
                    url: 'https://api-v2.soundcloud.com/search/suggest',
                    method: 'GET',
                    params: params,
                    transformResponse: ServiceHelpers.appendTransform($http.defaults.transformResponse, function(result) {
                        if (!result || !result.suggestions) return [];


                        return result.suggestions.map(function(suggestion) {
                            return {
                                value: suggestion.query.toLowerCase(),
                                display: suggestion.query
                            };
                        })
                    })
                }).success(function(data) {
                    resolve(data)
                }).error(function() {
                    reject();
                });
            });
        }

    };

}());
