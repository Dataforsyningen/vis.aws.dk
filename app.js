var express = require('express')
  , rp = require('request-promise');

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  console.log('get /');
  res.sendFile(__dirname + "/public/info.html", function (err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log('Sent: info.html');
    }
  });
});

function getTicket(usr,pw) {
  return new Promise((resolve, reject) => {
    var options= {};
    options.url='http://kortforsyningen.kms.dk/service';
    options.qs= {};
    options.qs.service= 'META';
    options.qs.request= 'GetTicket';
    options.qs.login= usr;
    options.qs.password= pw;
    //options.resolveWithFullResponse= true;
    var jsonrequest= rp(options).then((body) => {    
      console.log('getticket: %s, %d', body, body.length);
      if (body.length === 32) { // returnerer en status 200 ved ukendt username/password?!
        resolve(body);
      }
      else {
        reject('Ukendt username/password');
      }
    })
    .catch((err) => {
      reject('fejl i request af kortforsyningen: ' + err);
    });
  });
}

app.get('/getticket', function (req, res, next) { 
  getTicket(usr,pw).then((ticket) => {
    res.status(200).send(ticket);
  })
  .catch((err) => {
    res.status(400).send('Ukendt username og password: ' + err);
  });
}); 

app.get('/advvis', function (req, res) {
  //console.log(req);
  res.sendFile(__dirname + "/public/advvis.html", function (err) {
    if (err) {
      console.log('fejl: ' + err);
    }
    else {
      console.log('Sent: advvis.html');
    }
  });
}); 

app.get('/stat', function (req, res) {
  //console.log(req);
  res.sendFile(__dirname + "/public/stat.html", function (err) {
    if (err) {
      console.log('fejl: ' + err);
    }
    else {
      console.log('Sent: stat.html');
    }
  });
}); 

app.get('/live', function (req, res) {
  //console.log(req);
  res.sendFile(__dirname + "/public/live.html", function (err) {
    if (err) {
      console.log('fejl: ' + err);
    }
    else {
      console.log('Sent: stat.html');
    }
  });
}); 

app.get('/gis', function (req, res) {
  //console.log(req);
  res.sendFile(__dirname + "/public/gis.html", function (err) {
    if (err) {
      console.log('fejl: ' + err);
    }
    else {
      console.log('Sent: gis.html');
    }
  });
}); 

app.get('/adr', function (req, res) {
  //console.log(req);
  res.sendFile(__dirname + "/public/adr.html", function (err) {
    if (err) {
      console.log('fejl: ' + err);
    }
    else {
      console.log('Sent: gis.html');
    }
  });
}); 

app.get(/.+/, function (req, res) {
  //console.log(req);
  res.sendFile(__dirname + "/public/vis.html", function (err) {
    if (err) {
      console.log('fejl: ' + err);
    }
    else {
      console.log('Sent: index.html');
    }
  });
}); 

if (!(process.argv[2] && process.argv[3])) {
  console.log("node app.js <username> <password>");
  return;
}

var usr= process.argv[2]
  , pw= process.argv[3];

getTicket(usr,pw).then(ticket => {
  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('URL http://%s:%s', host, port);
  });
})
.catch(err => {
  console.log("Ukendt username og password (%s)",err);
})