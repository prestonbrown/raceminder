import * as firebase from 'firebase';

// Initialize Firebase
const config = {
  apiKey: "AIzaSyDqS3bF4JUGLpjfA4Sa6Pq8ALuxy_oLF80",
  authDomain: "raceminder.firebaseapp.com",
  databaseURL: "https://raceminder.firebaseio.com",
  projectId: "raceminder",
  storageBucket: "raceminder.appspot.com",
  messagingSenderId: "523488415738"
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const auth = firebase.auth();

export { auth };
