const fs = require('fs');
const http = require('http');
const url = require('url');
const replaceTemplate = require('./modules/replaceTemplate');

// const textInput = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textInput);

// const textOutput = `Data read : ${textInput}/n Written on ${Date.now()}`;

// fs.writeFileSync('./txt/output.txt', textOutput);

// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err) => {
//                 console.log('file written');
//             })
//         })
//     })
// })

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const productData = JSON.parse(data);

const server = http.createServer((req, res) => {
    const { query, pathname } = url.parse(req.url, true);

    if (pathname === '/' || pathname === '/overview') {

        const html = productData.map(data => replaceTemplate(tempCard, data)).join('');
        const output = tempOverview.replace('{{PRODUCT_CARD}}', html)
        res.writeHead(200, {'Content-Type' : 'text/html'})
        res.end(output);

    } else if (pathname === '/product') {

        const product = productData[query.id];
        const output = replaceTemplate(tempProduct, product);
        res.writeHead(200, {'Content-Type' : 'text/html'})
        res.end(output);

    } else if (pathname === '/api') {
        
        res.writeHead(200, {'Content-Type' : 'application/json'})
        res.end(data);

    } else {

        res.writeHead(404, {
            'Content-Type' : 'text/html',
            'new-header' : 'new-header'
        })
        res.end('<h1>Page Not Found!</h1>');

    }
})

// const server = http.createServer();

// server.on('request', (req, res) => {
//     const { query, pathname } = url.parse(req.url, true);

//     if (pathname === '/' || pathname === '/overview') {

//         const html = productData.map(data => replaceTemplate(tempCard, data)).join('');
//         const output = tempOverview.replace('{{PRODUCT_CARD}}', html)
//         res.writeHead(200, {'Content-Type' : 'text/html'})
//         res.end(output);

//     } else if (pathname === '/product') {

//         const product = productData[query.id];
//         const output = replaceTemplate(tempProduct, product);
//         res.writeHead(200, {'Content-Type' : 'text/html'})
//         res.end(output);

//     } else if (pathname === '/api') {
        
//         res.writeHead(200, {'Content-Type' : 'application/json'})
//         res.end(data);

//     } else {

//         res.writeHead(404, {
//             'Content-Type' : 'text/html',
//             'new-header' : 'new-header'
//         })
//         res.end('<h1>Page Not Found!</h1>');

//     }
// })

server.listen(8000, '127.0.0.1', () => {
    console.log('server listening on port 8000')
})