window.SCIndexedDB = (function () {

    const DB_NAME = 'soundcloudify';
    const DB_VERSION = 1;
    const DB_STORE_NAME = 'nowplaying';

    var db;

    return {
        openDb: openDb,
        getObjectStore: getObjectStore,
        clearObjectStore: clearObjectStore,
        getBlob: getBlob,
        update: update
    }

    function openDb() {

        console.log('open db ...');

        var req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onsuccess = function(evt) {
            db = this.result;
            console.log('open db DONE');
        }

        req.onerror = function(evt) {
            console.error("openDb:", evt.target.errorCode);
        }

        req.onupgradeneeded = function (evt) {
            console.log("openDb.onupgradeneeded");
            
            var playlistStore = evt.currentTarget.result.createObjectStore('playlist', {keyPath: 'uuid'});
            playlistStore.createIndex("sync", "sync", { unique: false });
            playlistStore.createIndex("deleted", "deleted", { unique: false });

            var nowplayingStore = evt.currentTarget.result.createObjectStore('nowplaying', {keyPath: 'uuid'});
            nowplayingStore.createIndex("sync", "sync", { unique: false });
            nowplayingStore.createIndex("deleted", "deleted", { unique: false });

            var starStore = evt.currentTarget.result.createObjectStore('starred', {keyPath: 'id'});
            starStore.createIndex("sync", "sync", { unique: false });
            starStore.createIndex("deleted", "deleted", { unique: false });
        };
    }

    function getObjectStore(mode) {
        var tx = db.transaction(DB_STORE_NAME, mode || 'readonly');
        return tx.objectStore(DB_STORE_NAME);
    }

    function clearObjectStore() {
        var store = getObjectStore(DB_STORE_NAME, 'readwrite');
        var req = store.clear();

        req.onsuccess = function(evt) {
            console.log(storeName + ' cleared');
        }

        req.error = function() {
            console.error('clearObjectStore: ' + evt.target.errorCode);
        }
    }

    function getBlob(key, successCallback) {

        var store = getObjectStore('readonly');

        var req = store.get(key);

        req.onsuccess = function(evt) {
            var value = evt.target.result;

            if (value) {
                successCallback(value);
            }
        }
    }

    function update(data) {
        var store = getObjectStore('readwrite');

        var updateRequest = store.put(data);

        updateRequest.onerror = function(event) {
            console.log('update error');
        };

        updateRequest.onsuccess = function(event) {
            console.log('update success');
        };
    }

}());