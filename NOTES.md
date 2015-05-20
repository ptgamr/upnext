# NOTES

- When pulling changes for playlist, if we saw a deleted playlist, the should never import it to indexedDB. Just find it and kill it

- Add "lastModified" & "deleted" field to playlistTracks. The /data should take care of this information and return correct changes for starred list:
  - not the whole list
  - include the deleted one
