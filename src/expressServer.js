const {app} = require('./server');

app.get('/', (req, res)=> res.status(200).send({message : 'Server is running fine...'}));

app.get('/api/v1', (req, res)=>res.status(200).send({message:  'Yep, the backend is running fine...'}));

app.use('/api/v1/user', require('./routes/userRoutes'));