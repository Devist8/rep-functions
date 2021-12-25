const isEmpty = (string) => {
    if (string.trim() === "") return true;
    else return false;
};

const isEmail = (email) =>
    !!email.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

exports.validateSignUp = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Must be a valid email address";
    }

    if (isEmpty(data.password)) errors.password = "Must not be empty";
    if (data.password !== data.confirmPassword)
        errors.confirmPassword = "Passwords must match";
    if (isEmpty(data.firstName) || isEmpty(data.lastName))
        errors.name = "Must not be empty";
    console.log(errors);
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

exports.validateLogIn = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = "Must not be empty";
    } else if (!isEmail(data.email)) {
        errors.email = "Must be a valid email address";
    }

    if (isEmpty(data.password)) errors.password = "Must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    };
};

/*  weight: 135,
DOB: '04/11/1995',
dietType: 'omnivore',
allergies: ['none']*/
exports.reduceUserDetails = (data) => {
    let userDetails = {
        info: {},
    };
    let errors = {};
    let regex =
        /^(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.](19|20)\d\d$/;
    if (!isEmpty(data.dietType)) {
        userDetails.info.dietType = data.dietType;
    } else {
        errors.dietType = "Please select a diet type";
    }

    if (!isEmpty(data.dob) && !!data.dob.match(regex)) {
        userDetails.info.dob = data.dob;
    } else {
        errors.dob = "Please enter a valid date of birth";
    }

    if (data.allergies.length !== 0) {
        userDetails.info.allergies = data.allergies;
    } else {
        errors.allergies =
            "Please select any allergies you have or select none if you do not have any.";
    }

    if (typeof data.weight === "number") {
        userDetails.weight.info = data.weight;
    } else {
        errors.weight = "Please enter a weight";
    }

    if (typeof data.height === "number") {
        userDetails.height.info = data.height;
    } else {
        errors.height = "Please enter a height";
    }

    if (data.goals.length !== 0) {
        userDetails.info.goals = data.goals;
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
        userDetails,
    };
};
