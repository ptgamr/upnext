(function() {

    angular.module('soundCloudify')
            .filter('prettyTime', prettyTimeFilter);

    function prettyTimeFilter() {
        return function(value) {
            var hours = Math.floor(value / 3600),
                    mins = '0' + Math.floor((value % 3600) / 60),
                    secs = '0' + Math.floor((value % 60));
                    mins = mins.substr(mins.length - 2);
                    secs = secs.substr(secs.length - 2);
            if(!isNaN(secs)){
                if (hours){
                    return hours+':'+mins+':'+secs;
                } else {
                    return mins+':'+secs;
                };
            } else {
                return '00:00';
            };
        };
    }
}());