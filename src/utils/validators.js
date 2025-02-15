const validator = require("validator");

const validateSignup = ({ email, password, firstName, lastName }) => {
  if (!firstName || !lastName || !email || !password) {
    throw new Error("There is an empty field!");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password is not strong enough! (Include uppercase, numbers, and special characters)"
    );
  }
};

const validateUpdatePassword = (password) => {
  if (!validator.isStrongPassword(password))
    throw new Error(
      "Password is not strong enough! (Include uppercase, numbers, and special characters)"
    );
};

module.exports = {
  validateSignup,
  validateUpdatePassword,
};
