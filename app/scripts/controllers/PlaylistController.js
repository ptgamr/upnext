(function() {

    function PlaylistController ($http, $routeParams, CLIENT_ID) {
        var self = this;

        this.category = $routeParams.category;
        console.log(this.category);

        function getTracks () {
            var params = { limit: 10, offset: 0, linked_partitioning: 1, client_id: CLIENT_ID };
            $http.get('https://api-v2.soundcloud.com/explore/' + self.category, { params: params })
                .success(function(data){
                    self.tracks = data.tracks;
                });

            //https://api-v2.soundcloud.com/explore/categories?limit=10&offset=0&linked_partitioning=1
            //https://api-v2.soundcloud.com/explore/Popular+Music?limit=10&offset=0&linked_partitioning=1&client_id=b45b1aa10f1ac2941910a7f0d10f8e28&app_version=3373577
        }

        getTracks();
    }

    soundCloudify = angular.module('soundCloudify');
    soundCloudify.controller('PlaylistController', ['$http', '$routeParams', 'CLIENT_ID', PlaylistController]);
}());

