exports.general = {
  validation: {
    isRequired: (field) => `${field} is required`,
    string: (field) => `${field} must be a string`,
    empty: (field) => `${field} cannot be empty`,
    minLength: (field, len) =>
      `${field} must be at least ${len} characters long`,
  },
  error: {
    notFound: (resource) => `${resource} not found`,
    badRequest: `Bad Request`,
    internalServerError: "An unexpected error occured. Please try later !",
  },
  success: {
    successfullCreation: (resource) => `${resource} created successfully`,
  }
};

exports.users = {
  validations: {
    username: {
      string: "Username must be a string",
      required: "Username is required",
      empty: "Username cannot be empty",
    },
    password: {
      required: "Password is required",
      string: "Password must be a string",
      empty: "Password field cannot be empty",
      minLen: "Password must be at least 4 characters long",
    },
    email: {
      required: "Email is required",
      isEmail: "Please enter a valid Email",
      empty: "Email cannot be empty",
      string: "Email must be a string",
    },
    name: {
      string: "First-Name must be a string",
    },
    slug: {
      string: "Slug must be string",
      empty: "Slug cannot be empty",
      required: "Slug is required",
    },
    profilePic: {
      string: "Profile Pic Url must be a string",
    },
    profileDescription : {
        string : 'Description must be a string'
    },
    phoneNo : {
        number : 'Please enter digits only in Phone No.'
    },
    countryCode : {
        number : 'Please enter digits only in Country Code'
    }
  },
  errors : {
    userAlreadyExists : 'Failed during sign-up, User already exists!'
  },
  success : {
    signUp : `User Sign-Up is successfull`
  }
};
