(function() {

    function MainController($http, $location, CLIENT_ID) {

        var self = this;

        this.isLoading = true;

        this.getCategories = function() {
            var params = { limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };

            $http.get('https://api-v2.soundcloud.com/explore/categories', { params: params })
                .success(function(data){
                    self.categories = data['music'];
                    self.selectedCategory = self.categories[0];
                    self.isLoading = false;
                });
        }

        this.start = function() {
            $location.path('/playlist/' + self.selectedCategory);
        };

        this.getCategories();
    }

    soundCloudify = angular.module('soundCloudify');
    soundCloudify.controller('MainController', ['$http', '$location', 'CLIENT_ID', MainController]);
}());