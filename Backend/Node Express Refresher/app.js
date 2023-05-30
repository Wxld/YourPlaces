// 1. How to write in a file
// const fs = require('fs');
// const username = "Max";

// fs.writeFile("user-data.txt", "Name: " + username, (err) => {
//     if(err) {
//         console.log(err);
//         return;
//     }
//     console.log("Written in file.")
// })

// const server = http.createServer((req, res) => {
//     console.log("Server Running!");
//     console.log(req.url, req.method);
     
//     res.setHeader('Content-Type','text/plain');
//     // Sent to the browser on GET function
//     res.end("<h1>Success!</h1>")
// })

// const http = require("http")
// const server = http.createServer((req, res) => {
//     // intially the request will be get and thus the else part will execute.
//     if(req.method === "POST") {
//         let body='';
//         // when data stopped coming we execute this.
//         req.on('end', () => {
//             console.log(body);
//             // body contains username=Wxld
//             const username = body.split('=')[1];
//             res.end('<h1>' + username + '</h1>')
//         })
//         // data is coming in chunks so we are accepting it
//         req.on('data', (chunk) => {
//             body += chunk;
//         })
//     } else {
//         res.setHeader('Content-Type', 'text/html')
//         res.end("<form method='post'><input type='text' name='username' /><button type='submit'>Create User</button></form>")
//     }
// })

// server.listen(5000);

// const express = require('express')

// const app = express()

// app.use((req, res, next) => {
//     let body = '';
//     req.on('end', () => {
//         const userName = body.split('=')[1];
//         if(userName) {
//             req.body = {name : userName};
//         }
//         next();
//     })
//     req.on('data', (chunk) => {
//         body += chunk;
//     })
// })
// // use is a middleware
// app.use((req, res, next) => {
//     if(req.body) {
//         return res.send('<h1>' + req.body.name + '</h1>')
//     }
//     res.send('<form method="POST"><input type="text" name="username"><button type="submit">Create User</button></form>')
// })
// app.listen(5000)


const express = require('express')
const bodyParser = require('body-parser')

const app = express();

// does the job of parsing data from requests body if they are url encoded type
// body : { username : < name you entered>}
app.use(bodyParser.urlencoded({extended : false}));

app.post('/user', (req, res, next) => {
    res.send('<h1> user : ' + req.body.username + '</h1>')
})

app.get('/', (req, res, next) => {
    res.send('<form action="/user" method="POST"><input type="text" name="username"><button type="submit">Create User</button></form>')
})


app.listen(5000);