"use strict";

const 
    AWS = require('aws-sdk');

const tableName = 'testing-token-1';
const accessKeyId = 'xxx';
const secretAccessKey = 'xxx';
const region = 'eu-west-1';
const endpoint = 'dynamodb.eu-west-1.amazonaws.com';    

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region,
    endpoint: endpoint
});

const dbClient = new AWS.DynamoDB.DocumentClient();

 

this.findEmailFromToken = (tokenHash) => {

  return new Promise(function(resolve, reject) {

    dbClient.get({
      TableName: tableName,
      Key: {
        tokenHash
      }
    }, (err, data) => {

      if (err) {
        return reject(err);
      }

      if (!data || !data.Item) {
        return reject('Token not found');
      }

      return resolve(data.Item.email);

    });

  });

}

this.constructPolicy = (email) => {
  let policy = {
    "principalId": "1",
    "policyDocument": {        
        "Version": "2012-10-17",
        "Statement": [
          {
            "Action": "execute-api:Invoke",
            "Effect": "Allow",
            "Resource": [
              "arn:aws:execute-api:eu-west-1:732042213639:r5wc3eim09/test/GET/instant-mobile-receiver-uploaded-files-test/" + escape(email) + "%2F*",
              "arn:aws:execute-api:eu-west-1:732042213639:r5wc3eim09/test/PUT/instant-mobile-receiver-uploaded-files-test/" + escape(email) + "%2F*"
            ]
          }
        ]
    }
  }; 

  return policy;
}


exports.handler = (event, context, callback) => {

  let token = event.authorizationToken;

  this.findEmailFromToken(token)

  .then(email => {
    
    let policy = this.constructPolicy(email); 
    callback(null, policy);
    
  })

  .catch(err => {
    callback(null, err);
  });
}

/**
  TEST
**/
/*
exports.handler(
  {
    authorizationToken: 'qYkXAeQKYteZikLR4M0Tktrm73dp6A7MmZs6Ki2tiJ0='
  },
  null,
  (err, data) => {
    console.log(err);
    console.log(JSON.stringify(data));
  }
)
*/