var CACHE_STATIC_NAME = 'static1';
var CACHE_DYNAMIC_NAME = 'dynamic1';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];
self.addEventListener('install', function(event){
    console.log('SW - Installing service worker..', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache){
                console.log('SW - Precaching App Shell');
                cache.addAll(STATIC_FILES);
            })
    )
});

self.addEventListener('activate', function(event){
    console.log('SW - Activating service worker..', event);
    event.waitUntil(
        caches.keys()
            .then(function(keyList){
                return Promise.all(keyList.map(function(key){
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
                        console.log('SW - Removing old cache.', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});


self.addEventListener('fetch', function(event){
    var url = 'https://httpbin.org/get';
    if(event.request.url.indexOf(url) > -1){ 
        //cache then network, only if we are calling outside URL such as APIs
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache){
                    return fetch(event.request)
                        .then(function(res){
                            cache.put(event.request, res.clone());
                            return res;
                        });
                })
        );
    }else if(new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url)){
        event.respondWith( //cache only strategy for static files, such as app shell
            caches.match(event.request)
        );
    }
    else{
        //cache with network fallback, only if we are brownsing our own resources
        event.respondWith(
            caches.match(event.request)
            .then(function(response){
                if(response){
                    return response;
                }else{
                    return fetch(event.request)//dynamic caching from fetch API if sources are newer
                        .then(function(res){
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then(function(cache){
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                });
                        })
                        .catch(function(err){//if network also faild, then show offline.html page
                            return caches.open(CACHE_STATIC_NAME)
                                .then(function(cache){
                                    if(event.request.url.indexOf('/help')){
                                        return cache.match('/offline.html');
                                    }
                                });
                        });
                }
            })
        );    
    }
});

/** CACHE THEN NETWORK */
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response){
//                 if(response){
//                     return response;
//                 }else{
//                     return fetch(event.request)//dynamic caching from fetch API if sources are newer
//                         .then(function(res){
//                             return caches.open(CACHE_DYNAMIC_NAME)
//                                 .then(function(cache){
//                                     cache.put(event.request.url, res.clone());
//                                     return res;
//                                 });
//                         })
//                         .catch(function(err){//if network also faild, then show offline.html page
//                             return caches.open(CACHE_STATIC_NAME)
//                                 .then(function(cache){
//                                     return cache.match('/offline.html');
//                                 });
//                         });
//                 }
//             })
//     );
// });

/** NETWORK WITH CACHE FALLBACK */
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         fetch(event.request)
//             .then(function(res){
//                 return caches.open(CACHE_DYNAMIC_NAME)
//                         .then(function(cache){
//                         cache.put(event.request.url, res.clone());
//                         return res;
//                     });
//             })
//             .catch(function(err){
//                 return caches.match(event.request);
//             })
//     );
// });

/** CACHE ONLY STRATEGY */
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response){
//                 return response;
//             })
//     );
// });

/** NETWORK ONLY STRATEGY */
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         fetch(event.request)
//     );
// });