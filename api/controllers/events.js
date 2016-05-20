'use strict';

module.exports = {
  createEvent: createEvent,
  getEventList: getEventList
};

var tableName = "Events";

var awsdb = require('../helpers/dynamodb_connect.js');

function createEvent(req, res) {
  var json = JSON.parse(req.body);
  var sessionId =  json.session_id;
  var userId = json.user_id;
  var eventTimestamp = json.timestamp;
  var eventContext = json.context;
  var eventType = json.type;
  
  var params = {
    TableName: tableName,
    Item:{
        "session_id_user_id": sessionId + '_' + userId,
        "session_id": sessionId,
        "user_id": userId,
        "timestamp": eventTimestamp,
        "context": eventContext,
        "type": eventType
    }
  };

  awsdb.put(params, function(err, data) {
    if (err) {
      console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
      res.json("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
      res.json(data);
    }
  });
  res.statusCode = 201;
}

function getEventList(req, res) {
  if (req.param('session_id')) {
    var sessionId = req.param('session_id');
    var userId = req.param('user_id');

    if (req.param('user_id')) {
      var params = {
        TableName: tableName,
        KeyConditionExpression: "session_id_user_id = :session_id_user_id",
        ExpressionAttributeValues: {
          ":session_id_user_id": sessionId + '_' + userId
        }
      };
    } else
    {
      var params = {
        TableName: tableName,
        IndexName: "session_id-timestamp-index",
        KeyConditionExpression: "session_id = :session_id",
        ExpressionAttributeValues: {
            ":session_id":sessionId
        }
      };
    }
    awsdb.query(params, function(err, data) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
      } else {
          console.log("Query succeeded.");
          console.log(data.Count);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.jsonp(data.Items);
      }
    });
  } else
  {
    res.json('session_id is required param');
    res.end();
  }

}