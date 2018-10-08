if(!window.Promise){ //if browser not support, it will use polyfill lib
    window.Promise = Promise;
}

if('serviceWorker' in navigator){
    navigator.serviceWorker
    .register('/sw.js')
    .then(function(){
        console.log('Service Worker registered!');
    });
}