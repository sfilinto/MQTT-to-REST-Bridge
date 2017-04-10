// MQTT to REST bridge for initialstate.com
// This Script will subscribe to a MQTT topic & POST the results to a REST url
// script put together by Sachin ( https://github.com/sfilinto ) & Rohit (https://github.com/trohit) based on https://github.com/chrismerck/mqtt2rest/
// Refered : http://support.initialstate.com/knowledgebase/articles/590091-how-to-stream-events-via-restful-api
//
//Pre-requisites
//sudo apt install nodejs
//sudo apt-get install npm
//npm install mqtt

// Variables
var mqtt_broker = 'YOUR_MQTT_BROKER_HOSTNAME' 		// e.g. 'mqtt.contoso.com'
var mqtt_port = 'YOUR_MQTT_BROKER_PORT' 			// default port is 1883
var mqtt_username = 'YOUR_MQTT_BROKER_USERNAME'
var mqtt_password = 'YOUR_MQTT_BROKER_PASSWORD'
var mqtt_topic = 'YOUR_MQTT_TOPIC'

var access_key = "YOUR_INITIAL_STATE_ACCESS_KEY"
var bucket_key = "YOUR_INITIAL_STATE_BUCKET_KEY"
var data_stream = "YOUR_INITIAL_STATE_DATA_STREAM"

//init
var mqtt_val = 0
var mqtt    = require('mqtt');
var mqtt_broker_url = 'mqtt://' + mqtt_broker;

var mqtt_broker_options = {
  port: mqtt_port,
  //clientId: // optional parameter
  username: mqtt_username,
  password: mqtt_password,
};
var mqtt_client  = mqtt.connect(mqtt_broker_url, mqtt_broker_options);

var https = require('https');


// display data returned from REST service
rest_callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });
	
  console.log("Pushing to REST API... [" + str + "]");

  response.on('end', function () {
    console.log(str);
  });
}

// subscribe to MQTT topic
mqtt_client.on('connect', function () {
  mqtt_client.subscribe(mqtt_topic);
  
  
});

// forward MQTT packets to REST
mqtt_client.on('message', function (topic, message) {
  	
  console.log("MQTT Received Packet from Broker: ",message.toString());
  mqtt_val = message.toString();
  
var options = {
  host: 'groker.initialstate.com',
  path: '/api/events?accessKey=' + access_key + '&bucketKey=' + bucket_key + '&' + data_stream + '=' + mqtt_val,
  port: '443',
  method: 'POST',  
};
 
  var req = https.request(options, rest_callback);
  req.write(JSON.stringify({topic: topic, message: mqtt_val}))
  req.end();

});
