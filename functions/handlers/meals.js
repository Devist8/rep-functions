const { admin, db } = require("../util/admin");
const firebase = require("firebase");

exports.createMeal = (req, res) => {
    const meal = {
        title: req.body.title,
        imageURL: req.body.imageURL,
        rating: req.body.rating,
        labels: req.body.labels,
        type: req.body.type,
        nutrition: req.body.nutrition,
        ingredients: req.body.ingredients,
        directions: req.body.directions,
        createdAt: new Date().toISOString(),
    };

    db.collection("meals")
        .add(meal)
        .then(() => {
            return res.json({ message: "Meal created!" });
        })
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong." });
        });
};

exports.getMealCollection = (req, res) => {
    db.collection("/meals")
        .get()
        .then((data) => {
            const meals = [];
            data.forEach((doc) => {
                meals.push(doc);
            });
            return res.json(meals);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        });
};
