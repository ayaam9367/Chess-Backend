if(process.env.NODE_ENV){
    const resultOfParsing = require('dotenv').config({
        path : `.env.${process.env.NODE_ENV}`
    })
} else {
    require('dotenv').config()
}

console.log(`Started Environment: ${process.env.NODE_ENV}`);
console.log(`Using configuration file : .env.${process.env.NODE_ENV}`);

const {server} = require('./server.js')
const connectDatabase = require('./config/database.js');
require('./utility/helpers/nodeCron.js');
require('./expressServer.js');

(async()=>{
    await connectDatabase();
})();
