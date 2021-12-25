const { admin, db } = require("../util/admin");
const firebase = require("firebase");
const dayjs = require("dayjs");

const {
    validateSignUp,
    validateLogIn,
    reduceUserDetails,
} = require("../util/validators");

const { uuid } = require("uuidv4");
const activities = require("../util/activities");
const { UserRecordMetadata } = require("firebase-functions/lib/providers/auth");

//Exercises
exports.createExercise = (req, res) => {
    const exercise = {
        activity: req.body.activity,
        motion: req.body.motion,
        difficulty: req.body.difficulty,
        title: req.body.title,
        createdAt: new Date().toISOString(),
        muscles: req.body.muscles,
        equipment: req.body.equipment,
        videoURL: req.body.videoURL,
        type: req.body.type,
    };

    db.collection("workouts")
        .add(exercise)
        .then(() => {
            return res.json({ message: "Exercise submitted successfully." });
        })
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong." });
        });
};

exports.deleteFromCollection = (req, res) => {
    const docId = req.params.docId;
    db.doc(`/workouts/${docId}`)
        .delete()
        .then(() => {
            return res.json({ message: `${docId} deleted` });
        })
        .catch((err) => {
            res.status(500).json({ error: err });
        });
};

exports.deleteFromUserCollection = (req, res) => {
    const docId = req.params.docId;

    db.doc(`/users/${req.user.userId}/workouts/docId`)
        .delete()
        .then(() => {
            return res.json({ message: `${docId} deleted` });
        })
        .catch(err);
};

//Schedule Exercise
//Params: (exercise, date, duration)
exports.scheduleExercise = (req, res) => {
    const scheduled = {
        ...req.body.exercise,
        date: req.body.date,
        status: "scheduled",
        duration: req.body.duration && req.body.duration,
    };

    db.collection(`/users/${req.body.user_id}/workouts/schedule`)
        .add(scheduled)
        .then(() => {
            return res.json({ message: "Exercise scheduled." });
        })
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong." });
        });
};

//Workouts
exports.getWorkoutId = (req, res) => {
    console.log("getting id");
    const docId = db.collection("workouts").doc().id;
    console.log(docId);
    return res.json({ id: docId });
};
exports.createWorkout = (req, res) => {
    const docId = req.body.id;
    let exerciseArray = [...req.body.exercises];
    exerciseArray.forEach((exercise) => {
        exercise.workoutId = docId;
    });
    const workout = {
        title: req.body.title,
        imageURL: req.body.imageURL,
        description: req.body.description,
        difficulty: req.body.difficulty,
        createdAt: new Date().toISOString(),
        equipment: req.body.equipment,
        muscles: req.body.muscles,
        exercises: exerciseArray,
        exerciseCount: req.body.exerciseCount,
        type: "workout",
    };

    db.collection("workouts")
        .doc(docId)
        .set(workout)
        .then(() => {
            return res.json({ message: "Workout created!" });
        })
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong." });
        });
};

//Schedule Workout
//Params: (workout, date, duration)
exports.scheduleWorkout = (req, res) => {
    const scheduled = {
        ...req.body.workout,
        date: req.body.date,
        status: "scheduled",
        duration: req.body.duration && req.body.duration,
    };

    scheduled.exercises.map((exercise, i) => {
        exercise.date = req.body.date;
        exercise.status = "scheduled";
        exercise.duration = req.body.exercises[i].duration
            ? req.body.exercises[i].duration
            : req.body.duration / scheduled.exercises.length;
    });

    db.collection(`/users/${req.body.user_id}/workouts/schedule`)
        .add(scheduled)
        .then(() => {
            return res.json({ message: "Workout scheduled." });
        })
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong." });
        });
};

//Programs
exports.createProgram = (req, res) => {
    const docId = req.body.id;
    let workoutObj = { ...req.body.workouts };
    Object.values(workoutObj).map((week) => {
        week.forEach((workout) => {
            workout.programId = docId;
        });
    });
    const program = {
        title: req.body.title,
        imageURL: req.body.imageURL,
        description: req.body.description,
        difficulty: req.body.difficulty,
        createdAt: new Date().toISOString(),
        equipment: req.body.equipment,
        muscles: req.body.muscles,
        workouts: workoutObj,
        workoutCount: req.body.workoutCount,
        exerciseCount: req.body.exerciseCount,
        type: "program",
    };

    db.collection("workouts")
        .doc(docId)
        .set(program)
        .then(() => {
            return res.json({ message: "Program created!" });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: "Something went wrong." });
        });
};

//Schedule Program
//Params: (program, startDate, days, duration)
exports.scheduleProgram = (req, res) => {
    let dateIndex = 0;
    const docId = db.collection("workouts").doc().id;
    let workoutObj = { ...req.body.workouts };
    Object.values(workoutObj).map((week) => {
        week.forEach((workout) => {
            workout.programId = docId;
            workout.exercises.map((exercise) => {
                exercise.week = week;
                exercise.programId = docId;
                exercise.workoutIndex = program.workouts[week].findIndex(
                    (x) => x.id === exercise.workoutId
                );
                exercise.exerciseIndex =
                    programs.workouts[week][workoutIndex].exercises[
                        exerciseIndex
                    ];
            });
        });
    });
    const scheduled = {
        ...req.body.program,
        workouts: workoutObj,
        status: "scheduled",
        duration: "",
    };

    const generateDateRange = () => {
        const prefferedDays = ["0", "1", "3", "5"];
        const newDateRange = [];
        let dateRange = [...scheduled.dateRange];
        let workoutCount = scheduled.workoutCount
            ? scheduled.workoutCount
            : getWorkoutCount(scheduled);
        let currentDate = dateRange[0];

        while (workoutCount > 0) {
            if (prefferedDays.includes(dayjs(currentDate).format("d"))) {
                newDateRange.push(currentDate);
                workoutCount = workoutCount - 1;
                currentDate = currentDate + 86400000;
            } else {
                currentDate = currentDate + 86400000;
            }
        }
        return newDateRange;
    };

    scheduled.dateRange = generateDateRange();

    Object.values(scheduled.workouts).map((week) => {
        week.map((workout) => {
            workout.date = dateRange[dateIndex];
            workout.exercises.map((exercise) => {
                exercise.date = dateRange[dateIndex];
            });
            dateIndex += 1;
        });
    });

    scheduled.exercises.map((exercise, i) => {
        exercise.date = req.body.date;
        exercise.status = "scheduled";
        exercise.duration = req.body.exercises[i].duration
            ? req.body.exercises[i].duration
            : req.body.duration / scheduled.exercises.length;
    });

    db.collection(`/users/${req.body.user_id}/workouts/schedule`)
        .add(scheduled)
        .then(() => {
            return res.json({ message: "Workout scheduled." });
        })
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong." });
        });
};

//Add to User Collection
//Needs to receive a data object with the exercise/workout/program (ewp) data
//Also needs user_id of user collection to add to
exports.addToCollection = (req, res) => {
    const docId = req.params.docId;
    const userId = req.params.userId;
    let type;
    db.doc(`/workouts/${docId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(404).json({ error: "Exercise not found." });
            } else {
                data = {
                    ...doc.data(),
                    referenceId: docId,
                    addDate: new Date().toISOString(),
                };
                type = `${data.type[0].toUpperCase()}${data.type.slice(1)}`;
                return db.collection(`/users/${userId}/workouts`).add(data);
            }
        })
        .then(() => {
            return res.json({
                message: `${type} added to ${req.user.user_id} collection`,
            });
        })
        .catch((err) => {
            return res.status(500).json({ error: err.code });
        });
};

exports.getWorkoutCollection = (req, res) => {
    const workoutData = {
        exercises: [],
        workouts: [],
        programs: [],
    };

    db.collection("/workouts")
        .get()
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
            }
        });
};

exports.getDemoData = (req, res) => {
    const demoData = {
        exercises: [],
        workouts: [],
        programs: [],
        meals: [],
    };

    db.collection(`/workouts`)
        .get()
        .then((data) => {
            data.forEach((doc) => {
                if (doc.data().type === "exercise") {
                    demoData.exercises.push({
                        ...doc.data(),
                        id: doc.id,
                    });
                } else if (doc.data().type === "workout") {
                    demoData.workouts.push({
                        ...doc.data(),
                        id: doc.id,
                    });
                } else {
                    demoData.programs.push({
                        ...doc.data(),
                        id: doc.id,
                        referenceId: doc.data().refrenceId,
                    });
                }
            });
            return db.collection("/meals").get();
        })
        .then((data) => {
            data.forEach((doc) => {
                demoData.meals.push({
                    ...doc.data(),
                    id: doc.id,
                });
            });
            console.log(data);
            return res.json({ demoData });
        })
        .catch((err) => console.error(err));
};
