const bcrypt = require('bcrypt');
const {SALT_ROUNDS} = require('../constants/constants');

async function hashPassword(password){
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
}

async function verifyPassword(inputPassword, hashedPassword){
    const result = await bcrypt.compare(inputPassword, hashedPassword);
    return result;  
}

module.exports = {
    hashPassword,
    verifyPassword
}