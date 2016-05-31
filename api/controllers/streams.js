'use strict';

module.exports = {
  getStreamItems: getStreamItems,
  putUploadStreamItem: putUploadStreamItem,
  putDownloadStreamItem: putDownloadStreamItem
};

var tableName = "Streams";

var awsdb = require('../helpers/dynamodb_connect.js');

function getStreamItems(req, res) {
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
        TableName : tableName,
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

function putUploadStreamItem(req, res) {
  var json = JSON.parse(req.body),
      sessionId =  json.session_id,
      userId = json.user_id,
      videoBitrate = json.video_bitrate,
      audioBitrate = json.audio_bitrate,
      framesPerSecond = json.frames_per_second,
      timestamp = json.timestamp;

  putStreamItem(req, res, sessionId, userId, videoBitrate, audioBitrate, framesPerSecond, timestamp, "upload");
}

function putDownloadStreamItem(req, res) {
  var json = JSON.parse(req.body),
      sessionId =  json.session_id,
      userId = json.user_id,
      videoBitrate = json.video_bitrate,
      audioBitrate = json.audio_bitrate,
      framesPerSecond = json.frames_per_second,
      timestamp = json.timestamp;

  putStreamItem(req, res, sessionId, userId, videoBitrate, audioBitrate, framesPerSecond, timestamp, "download");
}


function putStreamItem(req, res, sessionId, userId, videoBitrate, audioBitrate, framesPerSecond, timestamp, requestType) {
  var params = {
    TableName: tableName,
    Item:{
        "session_id_user_id_type": sessionId + '_' + userId + '_' + requestType,
        "session_id": sessionId,
        "user_id": userId,
        "video_bitrate": videoBitrate,
        "audio_bitrate": audioBitrate,
        "frames_per_second": framesPerSecond,
        "timestamp": timestamp,
        "type": requestType
    }
  };

  function putItem () {
    awsdb.put(params, function(err, data) {
      if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        res.json("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        // add handle item put
      } else {
        console.log("Added item:", JSON.stringify(data, null, 2));
        res.json(data);
      }
    });
  }

  putItem();
  res.statusCode = 201;
}