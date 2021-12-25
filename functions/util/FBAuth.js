const { admin, db } = require("../util/admin");

exports.FBAuth = (req, res, next) => {
    let idToken;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        idToken = req.headers.authorization.split("Bearer ")[1];
    } else {
        console.error("No token found");
        return res.status(403).json({ error: "Unauthorized" });
    }
    admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
            req.user = decodedToken;
            return db.doc(`users/${req.user.user_id}`).get();
        })
        .then((doc) => {
            req.user.email = doc.email;
            return next();
        })
        .catch((err) => {
            console.error(err);
            console.error("Error while verifying authentication token");
            return res.status(403).json(err);
        });
};
