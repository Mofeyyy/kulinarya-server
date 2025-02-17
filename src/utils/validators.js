import validator from "validator";

export const validateSignup = ({ email, password, firstName, lastName }) => {
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

export const validateUpdatePassword = (password) => {
  if (!validator.isStrongPassword(password))
    throw new Error(
      "Password is not strong enough! (Include uppercase, numbers, and special characters)"
    );
};
