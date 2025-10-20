const axios = require("axios");
const UserModel = require("../models/userModel");
const {hashPassword, verifyPassword} = require("../utility/helpers/helpers");

const allMessages = require("../utility/messages/en/allMessages");

const generalErrorMessages = allMessages.general.error;
const generalValidationMessages = allMessages.general.validation;
const userValidationMessages = allMessages.users.validations;
const userErrorMessages = allMessages.users.errors;
const userSuccessMessages = allMessages.users.success;

exports.signUpUser = async (data, activity) => {
  const { email, username, password } = data || {};

  const [existingUser, hashedPassword] = await Promise.all([
    UserModel.findOne({ isDeleted: false, $or: [{ username }, { email }] }),
    hashPassword(password),
  ]);

  if (existingUser) {
    console.log(`${activity} ${userErrorMessages.userAlreadyExists}`);

    return {
      status: false,
      code: 400,
      message: userErrorMessages.userAlreadyExists,
      isErrorForUser: true,
    };
  }

  const user = await UserModel.create({
    email,
    username,
    password: hashedPassword,
    isDeleted : false
  });

  if (!user) {
    console.log(`${activity} ${generalErrorMessages.internalServerError}`);

    return {
      status: false,
      isErrorForUser: true,
      messages: `Failed ! ${generalErrorMessages.internalServerError}`,
      code: 500,
    };
  }

  return {
    status: true,
    code: 201,
    message: userSuccessMessages.signUp,
    data: user,
    isErrorForUser: false,
  };
};

exports.updateUserProfile = async (data, activity) => {
  const { username, email, name, phoneNo, profilePic, profileDescription, id } =
    data || {};

  if (username || email) {
    const existingUser = await UserModel.findOne({
      isDeleted : false,
      $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
    });
    if (existingUser && existingUser._id.toString() !== id) {
      let message = "";
      if (existingUser.email === email)
        message = "This email is already associated with a different account";
      else if (existingUser.username === username)
        message = "This username is already taken";

      return {
        status: false,
        code: 400,
        message,
        isErrorForUser: true,
      };
    }
  }

  /**
   * Object.entries() → turns your object into an array like [["username", "john"], ["email", ""]]
     .filter() → removes any field whose value is null, undefined, or an empty string
     Object.fromEntries() → converts it back into an object
   */

  const dataToUpdate = Object.fromEntries(
    Object.entries({
      username,
      email,
      name,
      phoneNo,
      profilePic,
      profileDescription,
    }).filter(([_, v]) => v != null && v !== "")
  );

  const user = await UserModel.findOneAndUpdate(
    { _id: id, isDeleted : false },
    dataToUpdate,
    { new: true }
  );

  if (!user) {
    return {
      status: false,
      code: 404,
      message: `No such user exists`,
      isErrorForUser: true,
    };
  }

  return {
    status: true,
    code: 202,
    message: `Profile updated successfully`,
    isErrorForUser: false,
    data: user,
  };
};

exports.getAllUsers = async (query, activity) => {
  const { searchQuery = "", limit = 3 } = query;
  const escapedQuery = searchQuery
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .trim();
  let userFilters = {
    isDeleted : false,
  };
  if (escapedQuery) {
    userFilters.$or = [
      { username: { $regex: escapedQuery, $options: "i" } },
      { name: { $regex: escapedQuery, $options: "i" } },
    ];
  }

  const users = await UserModel.find(userFilters).limit(limit);

  if (!users) {
    return {
      status: false,
      code: 404,
      message: "No user found",
      isErrorForUser: true,
    };
  }

  return {
    status: true,
    code: 200,
    message: "Users fetched successfully",
    isErrorForUser: false,
    data: users,
  };
};

exports.getUserProfile = async (id, activity) => {
  // const id = { data };
  console.log(id);
  const user = await UserModel.findOne({ _id: id, isDeleted : false });

  if (!user) {
    return {
      status: false,
      code: 404,
      message: "User not found",
      isErrorForUser: true,
    };
  }

  return {
    status: true,
    code: 200,
    message: "User fetched successfully",
    isErrorForUser: false,
    data: user,
  };
};

exports.deleteUserProfile = async(id, activity) => {
  // const {id = ''} = data || {};
  if(!id || id == ''){
    return {
      status : false,
      message : 'Id is needed to delete the user. No Id found!',
      isErrorForUser : true,
      code : 400
    }
  }

  const user = await UserModel.findByIdAndUpdate({_id : id, isDeleted : false}, {isDeleted : true}, {new : true});
  
  if(!user){
    return{
      status : false,
      message : 'User not found.',
      isErrorForUser : true,
      code : 400,
    }
  }

  return {
    status : true,
    code : 200,
    message : 'User deleted successfully',
    isErrorForUser : false,
    data : user
  }
}

exports.loginUser = async(data, activity) => {
  const {email, password} = data;
  if(!email || !password){
    return {
      status : false,
      message : `email and password is necessary`,
      code : 400,
      isErrorForUser : true
    }
  }

  const userDetails = await UserModel.findOne({email});
  if(!userDetails){
    return {
      status : false,
      message : `You are not registered with us, please sign-up first`,
      isErrorForUser : true,
      code : 400
    }
  }

  const {password : dbPw} = userDetails;
  const doesPasswordMatch = verifyPassword(password, dbPw);
  
  if(!doesPasswordMatch){
    return {
      status : false,
      message : `invalid credentials`,
      isErrorForUser : true,
      code : 400
    }
  }

  const token = await userDetails.getJWTToken();
  return {
    status : true,
    code : 200,
    message : 'Login Successfull',
    isErrorForUser : false,
    data : token
  }
}
