const { admin, db } = require("../util/admin");
const firebase = require("firebase-admin");

exports.createStore = (req, res) => {
    const docId = db.collection("stores").doc().id;
    const storeInfo = {
        trainerId: req.body.userId,
        heroArray: [],
        categories: {},
        sections: {},
    };

    db.collection("stores")
        .doc(docId)
        .set(storeInfo)
        .then(() => {
            return db
                .doc(`/users/${storeInfo.trainerId}`)
                .update({ storeId: docId });
        })
        .then(() => {
            return res.json({ message: "Store created" });
        })
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong." });
        });
};

exports.getStoreByTrainer = (req, res) => {
    const trainerId = req.params.trainerId;
    const store = { inventory: [], sections: [] };
    const docs = [];

    db.collection("stores")
        .where("trainer", "==", trainerId)
        .limit(1)
        .get()
        .then((data) => {
            data.forEach((doc) => {
                store.info = { ...doc.data(), storeId: doc.id };
            });
            console.log(store);
            return db
                .collection(`/stores/${store.info.storeId}/collection`)
                .get();
        })
        .then((data) => {
            data.forEach((doc) => {
                store.inventory.push({ ...doc.data(), id: doc.id });
            });
            return db
                .collection(`/stores/${store.info.storeId}/sections`)
                .get();
        })
        .then((data) => {
            data.forEach((doc) => {
                store.sections.push(doc.data());
            });
            return res.json(store);
        })
        .catch((err) => console.error(err));
};

exports.updateStoreInfo = (req, res) => {
    const newInfo = req.body;
    const storeId = req.params.storeId;
    db.doc(`/stores/${storeId}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                db.doc(`/stores/${storeId}`).update(newInfo);
            } else {
                return res.status(404).json({ errror: "Store not found" });
            }
        })
        .then(() => ({ message: "Store updated successfully" }))
        .catch((err) => {
            return res.status(500).json({ error: "Something went wrong" });
        });
};

exports.addToStore = (req, res) => {
    const storeId = req.params.storeId;
    const newItem = {
        ...req.body,
    };
    console.log(storeId);

    const sections = req.body.sections;
    const categories = req.body.categories;
    let currentSections;
    let currentCategories;
    db.doc(`/stores/${storeId}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                currentSections = doc.data().sections;
                currentCategories = doc.data().categories;
                return db
                    .collection(`/stores/${storeId}/collection`)
                    .where("title", "==", newItem.title)
                    .get();
            } else {
                return res.status(404).json({ error: "Store not found" });
            }
        })
        .then((data) => {
            if (!data.docs.length > 0) {
                return db
                    .collection(`/stores/${storeId}/collection`)
                    .add(newItem);
            } else {
                return res.status(500).json({ error: "Already in store." });
            }
        })
        .then(() => {
            const data = {
                title: newItem.title,
                imageURL: newItem.imageURL,
                difficulty: newItem.difficulty,
                workoutCount: newItem.workoutCount
                    ? newItem.workoutCount
                    : null,
                exerciseCount: newItem.exerciseCount,
                type: newItem.type,
                price: newItem.type,
            };
            newItem.sections.forEach((section) => {
                return db.runTransaction((transaction) => {
                    return transaction
                        .get(db.doc(`/stores/${storeId}/sections/${section}`))
                        .then((doc) => {
                            if (!doc.exists) {
                                console.log("not found");
                            }
                            transaction.update(
                                db.doc(
                                    `/stores/${storeId}/sections/${section}`
                                ),
                                {
                                    items: firebase.firestore.FieldValue.arrayUnion(
                                        data
                                    ),
                                }
                            );
                        })
                        .then(() => console.log("added"))
                        .catch((err) => console.error(err));
                });
            });
        })
        .then(() => res.json({ message: "Item added" }))
        .catch((err) => {
            return console.error(err);
        });
};

exports.deleteFromStore = (req, res) => {
    const storeId = req.params.storeId;
    const itemId = req.body.itemId;

    db.doc(`/stores/${storeId}/collection/${itemId}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                db.collection(
                    `/stores/${storeId}/collection/${itemId}`
                ).delete();
            } else {
                return res.status(404).json({ error: "Store item not found." });
            }
        })
        .then(() => {
            return res.json({ message: "Store item deleted" });
        })
        .catch((err) =>
            res.status(500).json({ error: "Something went wrong" })
        );
};

exports.deleteStore = (req, res) => {
    const storeId = req.params.storeId;
    console.log(storeId);
    db.collection(`stores`)
        .doc(storeId)
        .delete()
        .then(() => res.json({ message: "store deleted" }))
        .catch((err) => console.error(err));
};

//Sections
exports.updateStoreSections = (req, res) => {
    const sections = req.body.sections;
    const storeId = req.params.storeId;

    db.doc(`/stores/${storeId}`)
        .update({ sections: sections })
        .then((data) => console.log(data))
        .catch((err) => res.status(500).json({ error: err }));
};

exports.addNewSection = (req, res) => {
    const newSection = req.body;
    const storeId = req.params.storeId;
    let sections = [];
    let info;

    db.doc(`/stores/${storeId}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return db
                    .doc(`/stores/${storeId}/sections/${newSection.title}`)
                    .get();
            } else {
                return res.status(404).json({ error: "Store not found" });
            }
        })
        .then((doc) => {
            return db
                .doc(`/stores/${storeId}/sections/${newSection.title}`)
                .set(newSection);
        })
        .then(() => {
            return res.json({ message: "Section added" });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                error: err,
            });
        });
};
