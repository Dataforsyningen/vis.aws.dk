var express = require('express');
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

app.get(/.+/, function (req, res) {
  console.log('get /.*');
  res.sendFile(__dirname + "/public/vis.html", function (err) {
    if (err) {
      console.log('fejl: ' + err);
    }
    else {
      console.log('Sent: index.html');
    }
  });
}); 

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('URL http://%s:%s', host, port);
});