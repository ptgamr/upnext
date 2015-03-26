#TODO LIST

### General
* [] Queue up track
* [] When track stream error, auto next()
* [] Batch action for multiple tracks (checkbox, delete, add to playlist etc)
* [] Paging / endless scrolling
** [] Search
** [] Top charts

### Playlist
* [] Delete track
* [] Play all tracks
* [] Queue all tracks
* [] Rename

### Player
* [x] Volume
* [] Repeat / Repeat One
* [] Shuffle

### Notification
* [] Dont' show notification when popup is open


### Search
* [] Remember recents search


### Sample youtube response 


#BUGS
[] player artwork won't change in some cases
[] Toast text color is still white

#Google Analytics

### page view
[] Now Playing
[] Search
[] Playlist
[] Top Charts

### search 
[] search term
[] click from recent search
[] toggle youtube
[] toggle soundcloud
[] result click for soundcloud
[] result click for youtube
[] star from search
[] add to playlist from search

### playlist
[] create a new playlist
[] remove playlist
[] playall playlist
[] view playlist

### player
[] toggle repeat all
[] toggle repeat one
[] toggle repeat off
[] toggle shuffle


```
//https://developers.google.com/youtube/v3/docs/videos
{
  "kind": "youtube#video",
  "etag": etag,
  "id": string,
  "snippet": {
    "publishedAt": datetime,
    "channelId": string,
    "title": string,
    "description": string,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "channelTitle": string,
    "tags": [
      string
    ],
    "categoryId": string,
    "liveBroadcastContent": string
  },
  "contentDetails": {
    "duration": string,
    "dimension": string,
    "definition": string,
    "caption": string,
    "licensedContent": boolean,
    "regionRestriction": {
      "allowed": [
        string
      ],
      "blocked": [
        string
      ]
    },
    "contentRating": {
      "acbRating": string,
      "agcomRating": string,
      "anatelRating": string,
      "bbfcRating": string,
      "bfvcRating": string,
      "bmukkRating": string,
      "catvRating": string,
      "catvfrRating": string,
      "cbfcRating": string,
      "cccRating": string,
      "cceRating": string,
      "chfilmRating": string,
      "chvrsRating": string,
      "cicfRating": string,
      "cnaRating": string,
      "csaRating": string,
      "cscfRating": string,
      "czfilmRating": string,
      "djctqRating": string,
      "djctqRatingReasons": [,
        string
      ],
      "eefilmRating": string,
      "egfilmRating": string,
      "eirinRating": string,
      "fcbmRating": string,
      "fcoRating": string,
      "fmocRating": string,
      "fpbRating": string,
      "fskRating": string,
      "grfilmRating": string,
      "icaaRating": string,
      "ifcoRating": string,
      "ilfilmRating": string,
      "incaaRating": string,
      "kfcbRating": string,
      "kijkwijzerRating": string,
      "kmrbRating": string,
      "lsfRating": string,
      "mccaaRating": string,
      "mccypRating": string,
      "mdaRating": string,
      "medietilsynetRating": string,
      "mekuRating": string,
      "mibacRating": string,
      "mocRating": string,
      "moctwRating": string,
      "mpaaRating": string,
      "mtrcbRating": string,
      "nbcRating": string,
      "nbcplRating": string,
      "nfrcRating": string,
      "nfvcbRating": string,
      "nkclvRating": string,
      "oflcRating": string,
      "pefilmRating": string,
      "rcnofRating": string,
      "resorteviolenciaRating": string,
      "rtcRating": string,
      "rteRating": string,
      "russiaRating": string,
      "skfilmRating": string,
      "smaisRating": string,
      "smsaRating": string,
      "tvpgRating": string,
      "ytRating": string
    }
  },
  "status": {
    "uploadStatus": string,
    "failureReason": string,
    "rejectionReason": string,
    "privacyStatus": string,
    "publishAt": datetime,
    "license": string,
    "embeddable": boolean,
    "publicStatsViewable": boolean
  },
  "statistics": {
    "viewCount": unsigned long,
    "likeCount": unsigned long,
    "dislikeCount": unsigned long,
    "favoriteCount": unsigned long,
    "commentCount": unsigned long
  },
  "player": {
    "embedHtml": string
  },
  "topicDetails": {
    "topicIds": [
      string
    ],
    "relevantTopicIds": [
      string
    ]
  },
  "recordingDetails": {
    "locationDescription": string,
    "location": {
      "latitude": double,
      "longitude": double,
      "altitude": double
    },
    "recordingDate": datetime
  },
  "fileDetails": {
    "fileName": string,
    "fileSize": unsigned long,
    "fileType": string,
    "container": string,
    "videoStreams": [
      {
        "widthPixels": unsigned integer,
        "heightPixels": unsigned integer,
        "frameRateFps": double,
        "aspectRatio": double,
        "codec": string,
        "bitrateBps": unsigned long,
        "rotation": string,
        "vendor": string
      }
    ],
    "audioStreams": [
      {
        "channelCount": unsigned integer,
        "codec": string,
        "bitrateBps": unsigned long,
        "vendor": string
      }
    ],
    "durationMs": unsigned long,
    "bitrateBps": unsigned long,
    "recordingLocation": {
      "latitude": double,
      "longitude": double,
      "altitude": double
    },
    "creationTime": string
  },
  "processingDetails": {
    "processingStatus": string,
    "processingProgress": {
      "partsTotal": unsigned long,
      "partsProcessed": unsigned long,
      "timeLeftMs": unsigned long
    },
    "processingFailureReason": string,
    "fileDetailsAvailability": string,
    "processingIssuesAvailability": string,
    "tagSuggestionsAvailability": string,
    "editorSuggestionsAvailability": string,
    "thumbnailsAvailability": string
  },
  "suggestions": {
    "processingErrors": [
      string
    ],
    "processingWarnings": [
      string
    ],
    "processingHints": [
      string
    ],
    "tagSuggestions": [
      {
        "tag": string,
        "categoryRestricts": [
          string
        ]
      }
    ],
    "editorSuggestions": [
      string
    ]
  },
  "liveStreamingDetails": {
    "actualStartTime": datetime,
    "actualEndTime": datetime,
    "scheduledStartTime": datetime,
    "scheduledEndTime": datetime,
    "concurrentViewers": unsigned long
  }
}
```