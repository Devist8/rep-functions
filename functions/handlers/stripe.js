const { db } = require("../util/admin");

const stripe = require("stripe")(
    "sk_test_51Hr3CTBp908J0ZFHDydXKTgduMKXi0qKto97T5iApBHU6hbM4WDUjlnKnR7KeVwYPuN2qlDGSIV5rri3N7tInyHe00wU1t7JRk"
);

exports.createPaymentIntent = async (req, res) => {
    let items = req.body.items;
    console.log(items);
    let storeId = req.body.storeId;
    let price = 0.0;
    console.log("getting price");
    let promiseArray = [];
    try {
        for (const item of items) {
            promiseArray.push(
                db.doc(`/stores/${storeId}/collection/${item.itemId}`).get()
            );
        }

        Promise.all(promiseArray).then(async (results) => {
            results.forEach((result) => {
                console.log(result.data().price);
                price += parseFloat(result.data().price);
            });
            console.log(price);
            console.log(`Price: ${price * 100.0}`);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: parseFloat(price) * 100,
                currency: "usd",
            });
            console.log(paymentIntent);
            return res
                .status(200)
                .json({ clientSecret: paymentIntent.client_secret });
        });
    } catch (err) {
        console.error(err);
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customer = await stripe.customers.create({
            email: req.body.email,
        });

        return res.status(200).json({ customerId: customer.id });
    } catch (err) {
        console.log(err);
    }
};

exports.createPaymentMethod = async (req, res) => {
    let customer = req.body.customerId;
    let cardInfo = req.body.cardInfo;
    let billingInfo = req.body.billing;

    let body = {
        type: "card",
        card: {
            number: cardInfo.number,
            exp_month: cardInfo.expMonth,
            exp_year: cardInfo.year,
            cvc: cardInfo.cvc,
        },
        billing_details: {
            address: {
                city: billingInfo.city,
                country: "US",
                line1: billingInfo.address1,
                line2: billingInfo.address2 && billingInfo.address2,
                postal_code: billingInfo.zip,
                state: billingInfo.state,
            },
        },
    };
};

exports.getPaymentMethods = async (req, res) => {
    console.log("getting payment methods");
    let customerId = req.params.customerId;

    try {
        const paymentMethods = await stripe.customers.listPaymentMethods(
            customerId,
            { type: "card" }
        );

        console.log(paymentMethods);

        return res.status(200).json({ paymentMethods: paymentMethods.data });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

const getPrice = async (items, storeId) => {
    console.log("getting price");
    let price = 0;
    for (const item of items) {
        let info = await db
            .collection(`/stores/${storeId}/collection/${item.itemId}`)
            .get();

        price += parseFloat(info.price);
    }
    console.log(price);
    return price;
};
