const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const creds = require('./creds.js');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const { exec } = require('child_process');

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(cors());

var uri = 'mongodb+srv://' + creds.mUSER + ':' + creds.mPASS + "@" + creds.mDBNAME;

mongoose
  .connect(uri, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
  .then(console.log("MongoDB Connection: Successful."))
  .catch(err => (console.log(err)));


app.use(session({
  secret: creds.sessSECRET,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({mongooseConnection: mongoose.connection})
})
);



app.use(passport.initialize());
app.use(passport.session());

app.listen(3001, () => {
  console.log('Running on port: 3001');
  });




//define routes
app.get('/druid/*', function(req, res) {
  res.sendFile(path.join(__dirname, './Projects/druid/build', 'index.html'))
});

app.get('/archer/*', function(req, res) {
  res.sendFile(path.join(__dirname, './Projects/archer/client/build', 'index.html'))
});

app.get('/rogue/*', function(req, res) {
  res.sendFile(path.join(__dirname, './Projects/rogue/build', 'index.html'))
});

app.get('/cleric/*', function(req, res) {
  res.sendFile(path.join(__dirname, './Projects/cleric', '/'))
});

app.get('/barbarian/*', function(req, res) {
  res.sendFile(path.join(__dirname, './Projects/barbarian/client/build', 'index.html'))
});

app.get('/sorceror/*', function(req, res) {
  res.sendFile(path.join(__dirname, './Projects/sorceror/build', 'index.html'))
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});




  //GitHub CI setup
app.post('/api/payload', (req, res) => {
  console.log('pulling from Github...');
  exec('git -C ~/heathenstudios pull -f', execCallback);
  exec('npm -C ~/heathenstudios install --production', execCallback);
  exec('npm -C ~/heathenstudios/client run build', execCallback);

})

function execCallback(err, stdout, stderr) {
  if(stdout) console.log(stdout);
  if(stderr) console.log(stderr);
}

app.post('/api/send', (req, res) => {
    let data = req.body
    let smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        auth:{
            user: creds.nmUSER,
            pass: creds.nmPASS
        }
    })

    smtpTransport.verify((error, success) => {
        if (error) {
            console.log(error);
          } else {
            console.log('Server is ready to take messages');
          }
    })
    let mailoptions={
        from: `${data.email}`,
        to: `${creds.nmTO}`,
        subject: `Portfolio Email Contact: ${data.name}`,
        html:`<ul><li>${data.name}</li><li>${data.email}</li></ul><p>${data.msg}</p>`,
    }

    let autoReply={
        from: `${creds.nmFROM}`,
        to: `${data.email}`,
        subject: 'Submission was successful',
        html: `<p>Thank you for contacting me!</p><p>I will be in touch within 3-5 working days. Please see your submission below:</p><p><ul><li>Name: ${data.name}</li><li>Email: ${data.email}</li><li>Message: ${data.msg}</li></ul></p><br /><p>Kind regards,</p>`,
    }

    smtpTransport.sendMail(mailoptions, (error, response) => {
        if(error){
            res.send(error)
        } else {
            res.send('Success')
            smtpTransport.sendMail({
                from: `${creds.nmFROM}`,
                to: `${data.email}`,
                subject: "Submission was successful",
                text: `Thank you for contacting me!\n\nI will be in touch within 3-5 working days. \nName: ${data.name}\n Email: ${data.email}\n Message: ${data.msg}`
              }, function(error, info){
                if(error) {
                  console.log(error);
                } else{
                  console.log('Message sent: ' + info.response);
                }
              });
        }
    })

    smtpTransport.close();
})

