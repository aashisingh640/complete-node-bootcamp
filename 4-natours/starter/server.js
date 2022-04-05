const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false}).then(con => {
    console.log('connected to database...');
}).catch(err => console.log('error in connecting database...', err))

app.listen(process.env.PORT || 3000, () => {
    console.log('server listening...')
})