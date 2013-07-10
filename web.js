var express = require('express');

var app = express.createServer(express.logger());

var buffer = fs.readFileSync("index.html", "utf8");

app.get('/', function(request, response) {
  // response.send('Hello Startup!');
  response.send(buffer.toString("utf8"));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
