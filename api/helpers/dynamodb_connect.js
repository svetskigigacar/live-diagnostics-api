var aws = require("aws-sdk")
aws.config.update({
  "accessKeyId": "AKIAJDP23FOV42BYHCFA",
  "secretAccessKey": "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",
  "region": "us-west-2",
  "endpoint": "https://dynamodb.us-west-2.amazonaws.com"
})

var awsdb = new aws.DynamoDB.DocumentClient();

module.exports = awsdb;

