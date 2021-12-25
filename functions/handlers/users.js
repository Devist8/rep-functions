const { admin, db } = require("../util/admin");
const firebase = require("firebase");
require("firebase/storage");
const {
    validateSignUp,
    validateLogIn,
    reduceUserDetails,
} = require("../util/validators");
const config = require("../util/config");
const { v4: uuid_v4 } = require("uuid");
const activities = require("../util/activities");
const {
    UserRecordMetadata,
    user,
} = require("firebase-functions/lib/providers/auth");
const { getSchedule } = require("./schedule");

firebase.initializeApp(config);

const defaultExercises = [
    {
        activity: "conditioning",
        difficulty: 3,
        equipment: [],
        motion: "push ups, moderate effort",
        muscles: ["biceps", "triceps", "chest"],
        schedule: [],
        title: "Push ups",
        type: "exercise",
        videoURL: "",
    },
    {
        activity: "calisthenics",
        difficulty: 2.5,
        equipment: [],
        motion: "sit ups, light effort",
        muscles: ["abs"],
        schedule: [],
        type: "exercise",
        videoURL: "",
    },
];

exports.addUserDetails = (req, res) => {
    const userDetails = req.body;
    delete userDetails.password;
    delete userDetails.confirmPassword;
    db.doc(`/users/${req.user.user_id}`)
        .update(userDetails)
        .then(() => {
            return res.json({ message: "Details added successfully" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};

exports.getUserDetails = (req, res) => {
    let userData = {
        exercises: [],
        workouts: [],
        programs: [],
        meals: [],
        schedule: [],
        application: {},
    };
    console.log(req.user.user_id);
    db.doc(`/users/${req.user.user_id}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                userData.user = { ...doc.data(), id: doc.id };
                if (userData.user.type === "trainer") {
                    return db.collection(`/workouts`).get();
                }
                return db
                    .collection(`/users/${req.user.user_id}/workouts`)
                    .get();
            } else {
                return res.status(404).json({ error: "User not found" });
            }
        })
        .then((data) => {
            if (data.docs.length > 0) {
                data.forEach((doc) => {
                    if (doc.data().type === "exercise") {
                        userData.exercises.push({
                            ...doc.data(),
                            id: doc.id,
                        });
                    } else if (doc.data().type === "workout") {
                        userData.workouts.push({
                            ...doc.data(),
                            id: doc.id,
                        });
                    } else {
                        userData.programs.push({
                            ...doc.data(),
                            id: doc.id,
                            referenceId: doc.data().refrenceId,
                        });
                    }
                });
                return db.collection("/meals").get();
            } else {
                db.collection(`/users/${req.user.user_id}/workouts`)
                    .add(defaultExercises[0])
                    .then(() => {
                        db.collection(`/users/${req.user.user_id}/workouts`)
                            .get()
                            .then((data) => {
                                data.forEach((doc) => {
                                    if (doc.data().type === "exercise") {
                                        userData.exercises.push({
                                            ...doc.data(),
                                            id: doc.id,
                                        });
                                    } else if (doc.data().type === "workout") {
                                        userData.workouts.push({
                                            ...doc.data(),
                                            id: doc.id,
                                        });
                                    } else {
                                        userData.programs.push({
                                            ...doc.data(),
                                            id: doc.id,
                                        });
                                    }
                                });
                            });
                        return db.collection("/meals").get();
                    });
            }
        })
        .then((data) => {
            data.forEach((doc) => {
                userData.meals.push({
                    ...doc.data(),
                    id: doc.id,
                });
            });
            return db.collection(`/users/${req.user.user_id}/schedule`).get();
        })
        .then((data) => {
            data.forEach((doc) => {
                userData.schedule.push({
                    ...doc.data(),
                    id: doc.id,
                });
            });
            return res.json({ userData });
        })
        .catch((err) => {
            return res.status(500).json({ error: err.code });
        });
};

exports.getAllUsers = (req, res) => {
    const users = [];
    db.collection("users")
        .get()
        .then((data) => {
            data.forEach((doc) => {
                users.push({
                    ...doc.data(),
                    id: doc.id,
                });
            });
            return res.json({ users });
        })
        .catch((err) => console.error(err));
};

exports.deleteNotification = (req, res) => {
    db.doc(`/notifications/${req.params.notificationId}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return db
                    .doc(`/notifications/${req.params.notificationId}`)
                    .delete();
            } else {
                return res
                    .status(404)
                    .json({ error: "Notification does not exist." });
            }
        })
        .then(() => {
            return res.json({ message: "Notification deleted successfully." });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: "Something went wrong" });
        });
};

exports.getMessages = (req, res) => {
    let messages = [];
    db.collection("messages")
        .where("contacts", "array-contains", `${req.user.user_id}`)
        .orderBy("createdAt")
        .limit(50)
        .onSnapshot((snapshot) => {
            messages = snapshot.docs.map((doc) => doc.data());
            return res.json(messages);
        })
        .catch((err) => console.error(err));
};
