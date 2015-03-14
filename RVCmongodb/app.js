if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  if (env['mongodb-2.4']) {
	var mongo = env['mongodb-2.4'][0]['credentials'];
  }
}

var create_message = function(req, res) {
  require('mongodb').connect(mongo.url, function(err, conn) {
    var collection = conn.collection('messages');
    
    // create message record
    var parsedUrl = require('url').parse(req.url, true);
    var queryObject = parsedUrl.query;
    var name = (queryObject["name"] || 'Bluemix');
    var message = { 'message': 'Hello, ' + name, 'ts': new Date() };
    collection.insert(message, {safe:true}, function(err){
      if (err) { console.log(err.stack); }
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write(JSON.stringify(message));
      res.end('\n');
    });
  });
}

var list_message = function(req, res) {
  require('mongodb').connect(mongo.url, function(err, conn) {
    var collection = conn.collection('messages');
   
    // list messages
    collection.find({}, {limit:10, sort:[['_id', 'desc']]}, function(err, cursor) {
      cursor.toArray(function(err, items) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        for (i=0; i < items.length; i++) {
          res.write(JSON.stringify(items[i]) + "\n");
        }
        res.end();
      });
    });
  });
}

var port = (process.env.VCAP_APP_PORT || 1337);
var host = (process.env.VCAP_APP_HOST || '0.0.0.0');

require('http').createServer(function(req, res) {
  if ( typeof mongo !== 'undefined' && mongo ) {
	//if (req.method == 'POST') {
	//  create_message(req, res);
    //}
	//else {
	//  list_message(req, res);
    //}
    create_message(req, res);
	list_message(req, res);
  } else {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write("No MongoDB service instance is bound.\n");
	  res.end();
  }
}).listen(port, host);
