const { admin, db } = require("../util/admin");
const firebase = require("firebase");

const {
    validateSignUp,
    validateLogIn,
    reduceUserDetails,
} = require("../util/validators");
const config = require("../util/config");
const { uuid } = require("uuid");
const activities = require("../util/activities");
const {
    UserRecordMetadata,
    user,
} = require("firebase-functions/lib/providers/auth");

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

exports.signup = (req, res) => {
    const newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
    };
    const userCredentials = {
        displayName: `${req.body.firstName} ${req.body.lastName}`,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        imageURL: ``,
    };

    const { errors, valid } = validateSignUp(newUser);
    if (!valid) return res.status(400).json(errors);

    let token, userId;

    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, req.body.password)
        .then((doc) => {
            userId = doc.user.uid;

            return doc.user.getIdToken();
        })
        .then((userToken) => {
            token = userToken;
            userCredentials.userId = userId;

            return db
                .doc(`/users/${userCredentials.userId}`)
                .set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({ token });
        })
        .catch((err) => {
            console.error(err);
            if (err.code == "auth/email-already-in-use") {
                errors.email = "Email already in use.";
                return res.status(400).json(errors);
            } else if (errors) {
                return res.status(400).json(errors);
            } else {
                return res.status(500).json({ error: err.code });
            }
        });
};

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    const { errors, valid } = validateLogIn(user);
    if (!valid) return res.status(400).json(errors);
    let userData;
    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((data) => {
            userData = data.user;
            return data.user.getIdToken();
        })
        .then((token) => {
            userData.token = token;
            return res.status(201).json(userData);
        })
        .catch((err) => {
            console.error(err);
            return res
                .status(403)
                .json({ general: "Wrong credentials, please try again." });
        });
};

exports.createUserDoc = (req, res) => {
    const userId = req.params.userId;
    const userDetails = req.body;

    console.log(userDetails);
    db.collection("users")
        .doc(userId)
        .set(userDetails)
        .then(() => {
            return res.json({ message: "User doc created" });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
