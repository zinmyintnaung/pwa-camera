var functions = require('firebase-functions');
var admin = require('firebase-admin');
var cors  = require('cors')({origin: true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
var serviceAccount = require("./pwaapp-key.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pwa-testapp-25632.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function(request, response) {
  cors(request, response, function(){
    admin.database().ref('posts').push({
        id: requst.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image
    })
    .then(function(){
        response.status(201).json({
            message: 'Data stored',
            id: request.body.id
        });
    })
    .catch(function(err){
        response.status(500).json({error:err});
    });
  });
}); 
