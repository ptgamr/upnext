(function(){
    'use strict';

    angular.module('soundCloudify')
        .service("TrackAdapter", TrackAdapter);

    function TrackAdapter (StarService) {

        var DEFAULT_THUMBNAIL = 'images/artwork-default.jpg';

        var ORIGIN_YOUTUBE = 'yt';
        var ORIGIN_SOUNDCLOUD = 'sc';

        return {
            adapt: adapt,
            adaptMultiple: adaptMultiple,
            decorateStar: decorateStar
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

            if (!track) {
                throw new Error('Can not adapt null');
            };

            var normalizedTrack = {};

            if (track.origin === ORIGIN_YOUTUBE || origin === ORIGIN_YOUTUBE) {
                normalizedTrack.id = track.id;
                normalizedTrack.title = track.snippet.title;
                normalizedTrack.artworkUrl = (track.snippet.thumbnails && track.snippet.thumbnails.default) ? track.snippet.thumbnails.default.url || DEFAULT_THUMBNAIL : DEFAULT_THUMBNAIL;
                normalizedTrack.streamUrl = null;
                normalizedTrack.user = 'youtube';
                normalizedTrack.likeCount = track.statistics ? track.statistics.likeCount : 0;
                normalizedTrack.dislikeCount = null;
                normalizedTrack.viewCount = track.statistics ? track.statistics.viewCount : 0;
                normalizedTrack.origin = ORIGIN_YOUTUBE;
                normalizedTrack.originalUrl = 'https://www.youtube.com/watch?v=' + track.id + '&source=soundcloudify';
                normalizedTrack.duration = parseDuration(track.contentDetails.duration);

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
                normalizedTrack.originalUrl = track.permalink_url + '?source=soundcloudify';
                normalizedTrack.duration = parseDuration(track.duration/1000);
            }

            normalizedTrack.uuid = window.ServiceHelpers.ID();
            normalizedTrack.starred = StarService.isTrackStarred(normalizedTrack);
            return normalizedTrack;
        }


        function adaptMultiple(tracks, origin) {
            return _.filter(_.map(tracks, function(track) {
                if (track)
                    return adapt(track, origin);
            }), function(track) {
                return track !== null && typeof track !== 'undefined';
            });
        }

        function decorateStar(tracks) {
            return _.filter(_.map(tracks, function(track) {
                if (track) {
                    track.starred = StarService.isTrackStarred(track);
                    return track;
                }
            }), function(track) {
                return track !== null && typeof track !== 'undefined';
            });
        }

        function parseDuration(duration) {

            var seconds = Number(duration);

            if (!isNaN(seconds)) {
                return duration;
            }

            if (duration.indexOf('PT') > -1) {
                var chunks = duration.replace('PT','').replace('H', ':').replace('M', ':').replace('S', '');
                chunks = chunks.split(':');

                if (chunks.length === 3) {
                    return (Number(chunks[0]) * 60 * 60) + (Number(chunks[1]) * 60) + Number(chunks[2]);
                } else if (chunks.length === 2) {
                    return (Number(chunks[0]) * 60) + Number(chunks[1]);
                } else if (chunks.length === 1) {
                    return Number(chunks[0]);
                }

                return 0;
            }
        }
    };

}());
