const { admin, db } = require("../util/admin");
const firebase = require("firebase");

exports.getFirebaseId = (req, res) => {
    let id = db.collection("workouts").doc().id;
    return res.json({ id: id });
};

exports.setIds = (req, res) => {
    db.collection("workouts")
        .get()
        .then((data) => {
            data.forEach((doc) => {
                if (doc.data().type === "workout") {
                    const workoutId = doc.id;
                    let newExercises = [...doc.data().exercises];
                    newExercises.forEach((exercise) => {
                        exercise.workoutId = workoutId;
                    });

                    db.doc(`/workouts/${workoutId}`)
                        .update({
                            exercises: newExercises,
                        })
                        .then(() => console.log("Workout updated"))
                        .catch((error) => {
                            console.error("Something went wrong");
                        });
                }
            });
        })
        .then(() => {
            return res.json({ message: "workouts updated" });
        })
        .catch((error) => {
            return res.status(500).json({ message: "Something went wrong" });
        });
};
