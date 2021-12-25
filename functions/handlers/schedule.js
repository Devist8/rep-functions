const { admin, db } = require("../util/admin");
const firebase = require("firebase");
const dayjs = require("dayjs");
const LocalizedFormat = require("dayjs/plugin/localizedFormat");

dayjs.extend(LocalizedFormat);

exports.addToSchedule = (req, res) => {
    const docId = db.collection(`/users/${req.user.user_id}/schedule`).doc().id;
    const exercise = req.body;
    console.log(exercise);
    /*const scheduleItem = { ...req.body };
    if (scheduleItem.type === "program") {
        Object.values(scheduleItem.workouts).map((week) => {
            week.forEach((workout, wIndex) => {
                workout.programId = docId;

                workout.exercises.map((exercise, eIndex) => {
                    exercise.week = workout.week;
                    exercise.programId = workout.programId;
                    exercise.workoutIndex = wIndex;
                    exercise.exerciseIndex = eIndex;
                });
            });
        });
    }
    scheduleItem.status = "scheduled";*/
    db.doc(`/users/${req.user.user_id}/schedule/${docId}`)
        .set(exercise)
        .then((data) => {
            return res.json({ message: `Scheduled` });
        })
        .catch((err) => {
            console.log(error);
            return res.status(500).json({ error: err });
        });
};

exports.getSchedule = (req, res) => {
    const yesterday = Date.now() - 86400000;
    db.collection(`/users/${req.user.user_id}/schedule`)
        .get()
        .then((data) => {
            const schedule = [];
            data.forEach((doc) => {
                schedule.push({
                    ...doc.data(),
                    id: doc.id,
                });
            });
            return res.json(schedule);
        })
        .catch((err) => {
            console.error(err);
        });
};

exports.updateScheduleItem = (req, res) => {
    const scheduleItem = { ...req.body };

    db.doc(`/users/${req.user.user_id}/schedule/${scheduleItem.id}`)
        .set(scheduleItem)
        .then(() => {
            return res.json({
                message: `${scheduleItem.id} updated in schedule`,
            });
        })
        .catch((err) => {
            return res.status(500).json({ error: err });
        });
};
