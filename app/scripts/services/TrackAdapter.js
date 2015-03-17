(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("TrackAdapter", TrackAdapter);

    function TrackAdapter () {
        
        var DEFAULT_THUMBNAIL = 'images/artwork-bar.jpg';

        var ORIGIN_YOUTUBE = 'yt';
        var ORIGIN_SOUNDCLOUD = 'sc';

        return {
            adapt: adapt,
            adaptMultiple: adaptMultiple
        };

        /**
        * Since the `Track` object come from different providers and has different schema,
        * we have to unify it into a single schema that compatible with our application.
        *
        * Also this brings one more benefit: it will reduce the unneccessary information that we dont need,
        * therefore, we don't waste storage space.
        *
        * Each track should have attached origin added by $http transform when retrieved by the application 
        * 
        */
        function adapt(track, origin) {

            if (!track) return null;

            var normalizedTrack = {};

            if (track.origin === ORIGIN_YOUTUBE || origin === ORIGIN_YOUTUBE) {

                normalizedTrack.id = track.id;
                normalizedTrack.title = track.snippet.title;
                normalizedTrack.artworkUrl = track.snippet.thumbnails.default.url || DEFAULT_THUMBNAIL;
                normalizedTrack.streamUrl = null;
                normalizedTrack.user = 'youtube';
                normalizedTrack.likeCount = track.statistics.likeCount;
                normalizedTrack.dislikeCount = null;
                normalizedTrack.viewCount = track.statistics.viewCount;
                normalizedTrack.origin = ORIGIN_YOUTUBE;

            } else {
                normalizedTrack.id = track.id;
                normalizedTrack.title = track.title;
                normalizedTrack.artworkUrl = track.artwork_url || track.user.avatar_url || DEFAULT_THUMBNAIL;
                normalizedTrack.streamUrl = track.stream_url;
                normalizedTrack.user = track.user.username;
                normalizedTrack.likeCount = track.likes_count;
                normalizedTrack.dislikeCount = null;
                normalizedTrack.viewCount = track.playback_count;
                normalizedTrack.origin = ORIGIN_SOUNDCLOUD;
            }

            return normalizedTrack;
        }


        function adaptMultiple(tracks, origin) {
            return tracks.map(function(track) {
                return adapt(track, origin);
            });
        }
    };

}());
