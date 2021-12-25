const functions = require("firebase-functions");

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const { db } = require("./util/admin");

const { FBAuth } = require("./util/FBAuth");

const {
    addUserDetails,
    getUserDetails,
    deleteNotification,
    getAllUsers,
} = require("./handlers/users");

const {
    createExercise,
    createProgram,
    createWorkout,
    deleteFromCollection,
    deleteFromUserCollection,
    addToCollection,
    getDemoData,
    getWorkoutId,
} = require("./handlers/workouts");

const { getFirebaseId, setIds } = require("./handlers/testing");

const {
    addToSchedule,
    getSchedule,
    updateScheduleItem,
} = require("./handlers/schedule");

const {
    createStore,
    getStore,
    updateStoreInfo,
    addToStore,
    deleteFromStore,
    getStoreByTrainer,
    updateStoreSections,
    addNewSection,
    deleteStore,
} = require("./handlers/store");

const {
    createPaymentIntent,
    createCustomer,
    getPaymentMethods,
} = require("./handlers/stripe");

const { createMeal, getMealCollection } = require("./handlers/meals");

const { signup, login, createUserDoc } = require("./handlers/auth");

const { getMessages } = require("./handlers/users");

//Testing
app.get("/firebaseId", getFirebaseId);
app.post("/setIds", setIds);

//User routes
app.post("/signup", signup);
app.post("/login", login);
app.get("/users", FBAuth, getAllUsers);
app.post("/user/:userId", createUserDoc);
app.get("/user", FBAuth, getUserDetails);
app.post("/user", FBAuth, addUserDetails);
app.delete("/notifications/:notificationId/delete", FBAuth, deleteNotification);

//Workout routes
app.post("/workouts/exercise", FBAuth, createExercise);
app.post("/workouts/workout", FBAuth, createWorkout);
app.post("/workouts/program", FBAuth, createProgram);
app.get("/workouts/id", FBAuth, getWorkoutId);
app.post("/user/:userId/workouts/:docId", FBAuth, addToCollection);
app.delete("/workouts/:docId", FBAuth, deleteFromCollection);
app.delete("/user/workout/:docId", FBAuth, deleteFromUserCollection);
app.get("/demo", FBAuth, getDemoData);

//Meal routes
app.get("/meals", FBAuth, getMealCollection);
app.post("/meals", FBAuth, createMeal);

//Schedule routes
app.get("/schedule", FBAuth, getSchedule);
app.post("/schedule", FBAuth, addToSchedule);
app.post("/schedule/update", FBAuth, updateScheduleItem);

//Store routes
app.post("/store", FBAuth, createStore);
app.get("/store/:trainerId", FBAuth, getStoreByTrainer);
app.post("/store/:storeId", FBAuth, addToStore);
app.post("/store/:storeId/update", FBAuth, updateStoreInfo);
app.delete("/store/:storeId/delete/:itemId", FBAuth, deleteFromStore);
//app.delete("/stores/:storeId", deleteStore);
app.post("/store/:storeId/sections", FBAuth, addNewSection);

//Stripe routes
app.post("/stripe/paymentIntent", createPaymentIntent);
app.post("/stripe/customer", createCustomer);
app.get("/stripe/paymentMethods/:customerId", getPaymentMethods);

//Message routes
app.get("/messages", FBAuth, getMessages);

exports.api = functions.region("us-east1").https.onRequest(app);

/*exports.createNotificationOnCreate = functions
    .region("us-east1")
    .firestore.document("repRequests/{id}")
    .onCreate((snapshot) => {
        return db
            .doc(`/notifications/${snapshot.id}`)
            .set({
                createdAt: new Date().toISOString(),
                recipient: snapshot.data().recipient,
                sender: snapshot.data().sender,
                type: "Rep Challenge",
                activity: snapshot.data().activity,
                read: false,
                repXP: snapshot.data().repXP,
            })
            .catch((err) => {
                console.error(err);
            });
    });

exports.createNotificationOnAccept = functions
    .region("us-east1")
    .firestore.document("repRequests/{id}")
    .onUpdate((change) => {
        if (change.before.data().accepted !== change.after.data().accepted) {
            return db
                .doc(`/notifications/${change.after.id}_accepted`)
                .set({
                    createdAt: new Date().toISOString(),
                    recipient: change.after.data().sender,
                    sender: change.after.data().recipient,
                    type: "Rep Challenge accepted",
                    activity: change.after.data().activity,
                    repXP: change.after.data().repXP,
                    read: false,
                })
                .catch((err) => console.error(err));
        }
    });

exports.createNotificationOnCompletion = functions
    .region("us-east1")
    .firestore.document("repRequests/{id}")
    .onUpdate((change) => {
        if (change.before.data().complete !== change.after.data().complete) {
            return db
                .doc(`/notifications/${change.after.id}_completed`)
                .set({
                    createdAt: new Date().toISOString(),
                    recipient: change.after.data().sender,
                    sender: change.after.data().recipient,
                    type: "Rep Challenge completed",
                    activity: change.after.data().activity,
                    repXP: change.after.data().repXP,
                    read: false,
                })
                .catch((err) => console.error(err));
        }
    });

exports.deleteNotificationOnDelete = functions
    .region("us-east1")
    .firestore.document("repRequests/{id}")
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`).delete();
    });*/
