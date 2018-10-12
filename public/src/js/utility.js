var dbPromise = idb.open('posts-store', 1, function(db){
    if(!db.objectStoreNames.contains('posts')){
        db.createObjectStore('posts', {keyPath: 'id'});//defining 'id' as primary key for posts table
    }
    if(!db.objectStoreNames.contains('sync-posts')){
        db.createObjectStore('sync-posts', {keyPath: 'id'});//sync-post is for offline post storage, later data from this table will be post to server when internet connection is available
    }
});

function writeData(st, data){
    return dbPromise
        .then(function(db){
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.put(data);
            return tx.complete;
        });
}

function readAllData(st){
    return dbPromise
        .then(function(db){
            var tx = db.transaction(st, 'readonly');
            var store = tx.objectStore(st);
            return store.getAll();
        });
}

function clearAllData(st){
    return dbPromise
        .then(function(db){
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.clear();
            return tx.complete;
        });
}

function deleteItemFromData(st, id){
    return dbPromise
        .then(function(db){
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.delete(id);
            return tx.complete;
        })
        .then(function(){
            console.log('Item deleted!');
        });
}