var cron = require('node-cron');
cron.schedule('* * * * *', async()=>{
    console.log('⏱️This is a sample cron')
})