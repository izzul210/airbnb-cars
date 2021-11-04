const functions = require("firebase-functions");
const admin = require('firebase-admin'); 

/*
EXPRESS - Modular Web Framework for Node.js
- Used for easier creation of web app and services
- Easier to write secure, modular and fast application
*/
const express = require('express');
const app = express();

// const firebaseConfig = {
//   apiKey: "AIzaSyDervwzHxO7n4OUojMbuHF7VI-0MQRXnDE",
//   authDomain: "airbnb-cars.firebaseapp.com",
//   projectId: "airbnb-cars",
//   storageBucket: "airbnb-cars.appspot.com",
//   messagingSenderId: "446886159002",
//   appId: "1:446886159002:web:9126c9aa3712dbc24df523",
//   measurementId: "G-1QDQ6VLNWW"
// };

// var serviceAccount = require("../airbnb-cars-firebase-adminsdk-rat0v-6ad9635064.json");

//To get access to the admin objects (Firestore database)
admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

app.get('/posts', (req, res) => {
    db
    .collection('posts')
    .get()
    .then(data => {
      let posts = []; 
      data.forEach(doc => {
          posts.push({
            postID: doc.id,
            carBrand: doc.data().carBrand,
            carName: doc.data().carName,
            location: doc.data().location,
            numSeats: doc.data().numSeats,
            imageUrl: doc.data().imageUrl,
            pricePerDay: doc.data().pricePerDay,
            userId: doc.data().userId,
            userImg: doc.data().userImg,
            userName: doc.data().userName,
            createdAt: doc.data().createdAt
          });
      });
      return res.json(posts);
    })
    .catch(err => console.error(err));
})



//FBAuth Function (Authentication Middleware)
// const FBAuth = (req, res, next) => {
//   let idToken;
//   if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
//     idToken = req.headers.authorization.split('Bearer ')[1];
//   } else{
//     console.error('No token found');
//     return res.status(403).json({ error: 'Unauthorized'});
//   }

//   //decodedToken = contains the user's data
//   admin.auth().verifyIdToken(idToken)
//        .then(decodedToken => {
//           console.log(decodedToken);
//           req.user = decodedToken;
//           return db.collection('users')
//                    .where('userId', '==', req.user.uid)
//                    .limit(1)
//                    .get();
//        })
//        .then(data => {
//          req.user.handle = data.docs[0].data().handle;
//          return next();
//        })
//        .catch(err => {
//          console.error('Error while verifying token', err);
//          return res.status(403).json(err);
//        })
// }

//Post a Car Rental
app.post('/post', (req,res) => {
  const newPost = {
    carName: req.body.carName,
    carBrand: req.body.carBrand,
    location: req.body.location,
    numSeats: req.body.numSeats,
    pricePerDay: req.body.pricePerDay,
    imageUrl: req.body.imageUrl,
    userName: req.body.userName,
    userId: req.body.userId,
    userImg: req.body.userImg,
    description: req.body.description,
    createdAt: new Date().toISOString()
  }

  db
    .collection('posts')
    .add(newPost)
    .then(doc => {
        res.json({ message: `document ${doc.id} created successfully`});
      })
    .catch(err => {
        res.status(500).json({ error: `Something went wrong`});
        console.error(err);
    })
})

/**** FUNCTIONS ****/
//Check if input is empty
// const isEmpty = (string) => {
//   if(string.trim() === ''){
//     return true 
//   } else{
//     return false;
//   }
// }

//Check Email format function
// const isEmail = (email) => {
//   const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
//   if(email.match(emailRegEx)) return true;
//   else return false;
// }


/*********** SIGNUP ROUTE ***************/
// app.post('/signup', (req, res) => {
//   const newUser = {
//     email: req.body.email,
//     password: req.body.password,
//     confirmPassword: req.body.confirmPassword,
//     handle: req.body.handle,
//   };

//   //Validate input
//   let errors = {};

//   if(isEmpty(newUser.email)){
//     errors.email = 'Must not be empty!'
//   } else if(!isEmail(newUser.email)){
//     errors.email ='Must be a valid email address'
//   }

//   if(isEmpty(newUser.password)){
//     errors.password = 'Must not be empty'
//   };

//   if(newUser.password !== newUser.confirmPassword){
//     errors.confirmPassword = 'Password must match';
//   };

//   if(Object.keys(errors).length > 0){
//     return res.status(400).json(errors);
//   }

//   //Validate data: Check if user has already exist or not
//   let token; let userId;

//   db
//     .doc(`/users/${newUser.handle}`)
//     .get()
//     .then(doc => {
//       if(doc.exists){
//         return res.status(400).json({ handle: 'This username is already taken'});
//       } else{
//         return admin
//                 .auth()
//                 .createUser({
//                   email: newUser.email,
//                   password: newUser.password
//                 })
//       }
//     })
//     .then((userRecord) => {
//       userId = userRecord.uid;
//       return admin
//                 .auth()
//                 .createCustomToken(userRecord.uid)
//     })
//     .then((tokenId) => {
//       //copy the tokenId created into the 'token'
//       token = tokenId;

//       //adding the user's information into the user database
//       const userCredentials = {
//         handle: newUser.handle,
//         email: newUser.email,
//         createdAt: new Date().toISOString(),
//         userId: userId
//       };
//       return db.doc(`/users/${newUser.handle}`).set(userCredentials);
//     })
//     .then(() => {
//       return res.status(201).json({ token });
//     })
//     .catch(err => {
//       console.error(err);
//       if(err.code == 'auth/email-already-in-use'){
//         return res.status(400).json({ email: 'Email is already in use'});
//       } else {
//         return res.status(500).json({error: err.code});
//       }
//     });
// });

/*********** LOGIN ROUTE ***************/
// app.post('/login', (req, res) => {
//   const user = {
//     email: req.body.email,
//     password: req.body.password
//   };

//   let errors = {};

//   if(isEmpty(user.email)){
//     errors.email = 'Must not be empty';
//   }

//   if(isEmpty(user.password)){
//     errors.password = 'Must not be empty';
//   }

//   if(Object.keys(errors).length > 0){
//     return res.status(400).json(errors);
//   }

// })

app.post('/getPostById', (req, res) => {
  db.doc(`/posts/${req.body.postId}`)
    .get()
    .then((doc) => {
      if(!doc.exists){
        return res.status(400).json({error: 'Sorry. Cant find with that postId'});
      }
      postData = doc.data();
      postData.postId = doc.id;
      return res.json(postData);
    })
})

app.post('/getPostByBrand', (req,res) => {
  db.collection('posts')
    .where('carBrand', '==', req.body.carBrand)
    .get()
    .then((data) => {
      postsData = [];
      data.forEach((doc) => {
        postsData.push({
          ...doc.data(),
          postID: doc.id
        });
      })
      return res.json(postsData);
    })
})

app.post('/getPostByLocation', (req,res) => {
  db.collection('posts')
    .where('location', '==', req.body.location)
    .get()
    .then((data) => {
      postsData = [];
      data.forEach((doc) => {
        postsData.push({
          ...doc.data(),
          postID: doc.id
        });
      })
      return res.json(postsData);
    })
})


exports.api = functions.https.onRequest(app);

