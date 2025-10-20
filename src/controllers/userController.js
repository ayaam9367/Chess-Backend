const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");
const { isValidObjectId } = require("mongoose");
const userService = require("../services/userService");
const allMessages = require("../utility/messages/en/allMessages");

const generalErrorMessages = allMessages.general.error;
const generalValidationMessages = allMessages.general.validation;
const userValidationMessages = allMessages.users.validations;

const userSignUpDataValidation = (data) => {
  const { error = false, value } = Joi.object({
    username: Joi.string()
      .trim()
      .required()
      .disallow("")
      .messages({
        "any.required": `${userValidationMessages.username.required}`,
        "string.base": `${userValidationMessages.username.string}`,
        "string.empty": `${userValidationMessages.username.empty}`,
      }),
    email: Joi.string()
      .trim()
      .email()
      .required()
      .disallow("")
      .messages({
        "any.required": `${userValidationMessages.email.required}`,
        "string.base": `${userValidationMessages.email.string}`,
        "string.empty": `${userValidationMessages.email.empty}`,
        "string.email": `${userValidationMessages.email.isEmail}`,
      }),
    password: Joi.string()
      .trim()
      .required()
      // .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W_]).+$"))
      // .min(PASSWORD_MIN_LENGTH)
      .messages({
        // "string.pattern.base": userValidationMessages.password.complexity,
        "string.empty": userValidationMessages.password.empty,
        // "string.min": userValidationMessages.password.minLen,
        "any.required": userValidationMessages.password.required,
      })
  })
    .unknown()
    .validate(data);

  return {
    isError: error,
    value,
  };
}; 

exports.signUpUser = async (req, res) => {
  const activity = "Add User |";
  try {
    const { isError, value: validatedBody } = userSignUpDataValidation(
      req?.body
    );

    /**
     * if the body is not validated, send an error response -
     *
     * @return statusCode = 400,
     *         status to tell the status of the request
     *          message to display
     *          isErrorForUser - whether to display the status message on the client frontend
     */
    if (isError) {
      console.log(`${activity} ${isError}`);
      return res.status(400).send({
        status: false,
        message: isError?.message,
        isErrorForUser: true,
      });
    }

    const {
      status = false,
      data = {},
      code = 500,
      message = generalErrorMessages.internalServerError,
      isErrorForUser = true,
    } = await userService.signUpUser(validatedBody, activity);

    return res.status(code).send({
      status,
      message,
      data,
      isErrorForUser,
    });
  } catch (error) {
    console.log(`${activity} | Error while adding user`, error?.message);
    return res.status(error?.statusCode || 500).send({
      status: false,
      message: `Error while adding user : ${error?.message}`,
    });
  }
};

exports.loginUser = async(req, res) => {
  const activity = 'Login User';
  try{
    const {data, status, code, isErrorForUser, message} = await userService.loginUser(req?.body, activity);
    if(!status){
      console.log(`${activity} ${message}`);
    }
    return res.status(code).send({
      status,
      message,
      isErrorForUser,
      data
    })
  } catch (error){
    console.log(`Internal server error : ${error.message}`);
    return res.status(error?.statusCode || 500).send({
      status: false,
      message: `Internal server error`,
      isErrorForUser: true,
    })
  }
}

exports.getAllUsers = async (req, res) => {
  const activity = "Get All Users |";
  try {
    const {search = '', limit = ''} = req?.query || {};
    const query = {
      searchQuery : search,
      limit
    }
    const { data, status, code, message, isErrorForUser } =
      await userService.getAllUsers(query, activity);
    if (!status) {
      console.error(`${activity} ${message}`);
    }

    //DOUBT : what happens when i do not send data as {data} in the response object below ???

    return res.status(code).send({
      status,
      message,
      ...(data && { data }),
      isErrorForUser,
    });
  } catch (error) {
    console.log(`Internal server error : ${error.message}`);
    return res.status(error?.statusCode || 500).send({
      status: false,
      message: `Internal server error`,
      isErrorForUser: true,
    });
  }
};

exports.getUserProfile = async (req, res) => {
  const activity = "Get User Profile |";
  try {
    const userId = req?.params.id;
    const { data, status, code, message, isErrorForUser } =
      await userService.getUserProfile(userId, activity);

    if (!status) {
      console.log(`${activity} ${message}`);
    }
    return res.status(code).send({
      status,
      message,
      isErrorForUser,
      data,
    });
  } catch (error) {
    console.log(`Internal server error : ${error.message}`);
    return res.status(error?.statusCode || 500).send({
      status: false,
      message: `Internal server error`,
      isErrorForUser: true,
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  const activity = "Update User Profile |";
  try {
    const reqData = req?.body;
    const { data, status, code, message, isErrorForUser } =
      await userService.updateUserProfile(reqData, activity);
    if (!status) {
      console.log(`${activity} ${message}`);
    }
    return res.status(code).send({
      status,
      message,
      isErrorForUser,
      data,
    });
  } catch (error) {
    console.log(`Internal server error : ${error.message}`);
    return res.status(error?.statusCode || 500).send({
      status: false,
      message: `Internal server error`,
      isErrorForUser: true,
    });
  }
};

exports.deleteUserProfile = async (req, res) => {
  const activity = "Delete User Profile |";
  try {
    const id  = req?.params.id;
    const { data, status, code, message, isErrorForUser } =
      await userService.deleteUserProfile(id, activity);

    if (!status) {
      console.log(`${activity} ${message}`);
    }
    return res.status(code).send({
      status,
      message,
      isErrorForUser,
      data,
    });
  } catch (error) {
    console.log(`Internal server error : ${error.message}`);
    return res.status(error?.statusCode || 500).send({
      status: false,
      message: `Internal server error`,
      isErrorForUser: true,
    });
  }
};

/**
 * Use a complex mechanism for login and logout systems - 
 * Access Token (expires in 15 mins) + Refresh Token (expires in 2 days) mechanism
 * Once logged out, clear both token from the frontend. 
 * Blacklist refresh token after log out so even in case of stealing refresh token, its blacklisted. save blacklist on redis until it expires
 * 
 * Check and test edge cases in the code, like what if a user tries to sign up using the previously used email
 */
    //   name: Joi.string()
    //   .allow("")
    //   .optional()
    //   .messages({
    //     "string.base": `${validationMessages.name.string}`,
    //   }),
    // slug: Joi.string()
    //   .trim()
    //   .required()
    //   .disallow("")
    //   .messages({
    //     "string.base": `${validationMessages.slug.string}`,
    //     "string.empty": `${validationMessages.slug.empty}`,
    //     "any.required": `${validationMessages.slug.required}`,
    //   }),
    // profilePic: Joi.string()
    //   .trim()
    //   .allow("")
    //   .optional()
    //   .messages({
    //     "string.base": `${validationMessages.profilePic.string}`,
    //   }),
    // profileDescription: Joi.string()
    //   .trim()
    //   .allow("")
    //   .optional()
    //   .messages({
    //     "string.base": `${validationMessages.profileDescription.string}`,
    //   }),
    // phoneNo: Joi.number().messages({
    //   "number.base": `${validationMessages.phoneNo.number}`,
    // }),
    // countryCode: Joi.number()
    //   .symbols()
    //   .messages({
    //     "any.number": `${validationMessages.countryCode.number}`,
    //   }),