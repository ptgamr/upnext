GIVEN: client1 & client2

### Add Track

WHEN client2 [addtrack] AND client1 [addtrack] THEN

    GIVEN client1 = [1,2,3,4,5] (sync)
    THEN client2 add track: server = [1,2,3,4,5,6]
    THEN client1 add track: client1 = [1,2,3,4,5,6]
    THEN client1 pull: client1 = [1,2,4,5,6 (from client1), 6 (from client2)]
    THEN client1 [CONFLICT]
    [RESOLUTION]: track from client2 has lower order than track from client1, which means after the resolution, client1 state should be [1,2,3,4,5,6,7]
    After synchronization, the _local track should have higher order than any other tracks from server


WHEN client2 [playnext] AND client1 [addtrack] THEN

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 playnext: server = [6,5*,4,3,2,1] (* is the song playnext to 5, 5 after that will become 6)
    THEN client1 add track: client1 = [6*,5,4,3,2,1]
    THEN client1 pull: client1 = [6*,6,5*,4,3,2,1]
    THEN client1 [CONFLICT]
    [RESOLUTION]: After synchronization, the _local track should have higher order than any other tracks from server


WHEN client2 [playnext] AND client1 [playnext] at same position THEN

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 playnext, server = [6,5*,4,3,2,1]
    THEN client1 playnext, client1 = [6,5**,4,3,2,1]
    THEN client1 pull, client1 = [6,5*,5**,4,3,2,1]
    THEN client1 CONFLICT
    [RESOLUTION]: the _local track should have higher order than _server track
        [6,local_5,server_5, 4,3,2,1]


WHEN client2 [playnext] AND client1 [playnext] at different position THEN

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 playnext, server = [6,5*,4,3,2,1] (* the inserted track)
    THEN client1 playnext, client1 = [6,5,4*,3,2,1] (* the inserted track)
    THEN client1 pull, client1 = [6,5*,4,4*,3,2,1]
    THEN client1 CONFLICT
    RESOLUTION: _server track has higher order than _local track
        [6,5,server_4,local_4,3,2,1] ?????

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 playnext, server = [6,5*,4,3,2,1] (* the inserted track)
    THEN client1 playnext, client1 = [6,5,4,3,2*,1] (* the inserted track)
    THEN client1 pull, client1 = [6,5*,4,3,2,2*,1]
    THEN client1 CONFLICT
    RESOLUTION: _server track has higher order than _local track
        [6,5,4,3,server_2,local_2,1] ?????

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 playnext, server = [6,5,4*,3,2,1] (* the inserted track)
    THEN client1 playnext, client1 = [6,5*,4,3,2,1] (* the inserted track)
    THEN client1 pull, client1 = [6,5*,5,4*,3,2,1]
    THEN client1 CONFLICT
    RESOLUTION: _local track has higher order the _server track
        [6,local_5,server_5,4,3,2,1]

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 playnext, server = [6,5,4,3*,2,1] (* the inserted track)
    THEN client1 playnext, client1 = [6,5*,4,3,2,1] (* the inserted track)
    THEN client1 pull, client1 = [6,5*,5,4,3,2,1]
    THEN client1 CONFLICT
    RESOLUTION: _local track has higher order the _server track
        [6,local_5,server_5,4,3,2,1]

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 playnext, server = [6,5,4,3*,2,1] (* the inserted track)
    THEN client1 playnext, client1 = [6,5*,4,3,2,1] (* the inserted track)
    THEN client1 pull, client1 = [6,5*,5,4,3,2,1]
    THEN client1 CONFLICT
    RESOLUTION: _local track has higher order the _server track
        [6,local_5,server_5,4,3,2,1]


### Remove Track
WHEN client2 [removetrack] AND client1 [addtrack] THEN

    GIVEN client1 = [5,4,3,2,1] (sync)
    THEN client2 remove track: server = [5,4,3,1]
    THEN client1 add track: client1 = [6,5,4,3,2,1]
    THEN client1 pull: client1 = [6,5,4,3,2,1]
    THEN client1 has [2] still there while it should be deleted
    [OK]

### Play All

### Remove