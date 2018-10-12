var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  setTimeout(function(){
    createPostArea.style.transform = 'translateY(0)';
  }, 1);
}

function closeCreatePostModal() {
  //createPostArea.style.display = 'none';
  createPostArea.style.transform = 'translateY(100vh)';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
// Currently not in use, allow to save assets in cache on demand
// function onSaveButtonClicked(event){
//   if('caches' in window){
//     caches.open('user-requested')
//       .then(function(cache){
//         cache.add('https://httpbin.org/get');
//         cache.add('/src/images/sf-boat.jpg');
//       });
//   }
// }

function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data){
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url('+ data.image +')';
  cardTitle.style.backgroundSize = 'cover';
  //cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';

  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);

  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data){
  clearCards();
  for(var i=0; i<data.length; i++){
    createCard(data[i]);
  }
}

var url = 'https://pwa-testapp-25632.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
  .then(function(res){
    return res.json();
  })
  .then(function(data){
    networkDataReceived = true;
    console.log('From web..', data);
    var dataArray = [];
    for(var key in data){
      dataArray.push(data[key])
    }
    updateUI(dataArray);
  });

if('indexedDB' in window){
  readAllData('posts')
    .then(function(data){
      if(!networkDataReceived){
        console.log("From indexDB ", data);
        updateUI(data);
      }
    });
}

function sendData(){
  fetch('https://us-central1-pwa-testapp-25632.cloudfunctions.net/storePostData', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date.toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwa-testapp-25632.appspot.com/o/sf-boat.jpg?alt=media&token=9c9a4d6a-e7c4-4b84-8f6d-7ba48b3fd3b2'
    })
  })
  .then(function(res){
    console.log('Sent data...', res);
    updateUI();
  });
}

form.addEventListener('submit', function(event){
  event.preventDefault();
  //validate user input
  if(titleInput.value.trim() === '' || locationInput.value.trim() === ''){
    alert('Please enter valid data');
    return;
  }
  //if pass, then close the modal first before posting
  closeCreatePostModal();
  if('serviceWorker' in navigator && 'SyncManager' in window){
    
    navigator.serviceWorker.ready
      .then(function(sw){
        var post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value
        };
        writeData('sync-posts', post)
          .then(function(){
            sw.sync.register('sync-new-posts');//sync-new-post is the name (call as event tag) of the sync task
          })
          .then(function(){
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = {message: 'Your post was saved for syncing!'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function(err){
            console.log(err);
          });
        
      });
  }else{
    //fallback for browser with no sync manager supported yet
    sendData();
  }
});

