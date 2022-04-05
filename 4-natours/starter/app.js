const express = require('express');
const http = require('http');

const AppError = require('./utils/appError');
const errorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

const app = express();

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
})

app.use(errorHandler);

function fetchData() {
    const url = 'http://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json';
    
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
          }
    }

    const req = http.request(url, options, (res) => {
        console.log(res.statusCode);
        const data = [];
        res.on('data', d => {
            data.push(d);
        }).on('end', () => {
            console.log(JSON.parse(data.toString()));
        })
    })

    req.on('error', err => {
        console.log(err);
    })

    req.end();
}

fetchData();

module.exports = app;