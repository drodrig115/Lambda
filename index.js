
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});

exports.handler = async (event, context, callback) => {
    //https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_Record.html
    for (const record of event.Records) {
        let body = record.dynamodb;

        switch(record.eventName){
            
            case "INSERT":
                console.log("INSERT -----------------------------------------------------------------------");
                //ensure that data is not a duplicate?
                console.log("Inserting item with CaseID: " + body.NewImage.CaseID.S);
                //data MUST match in dynamoDB stream
                await createMessage(record.eventID, body.NewImage.CaseID.S, body.NewImage.Status.S).then(() => {
                    callback(null, {
                        statusCode: 201,
                        body: '',
                        headers: {
                            'Access-Control-Allow-Origin' : '*'
                        }
                    })
                }).catch((err) => {
                    console.error(err)
                });
                console.log("INSERT -----------------------------------------------------------------------");
                break;
                
            case "MODIFY":
                console.log("MODIFY -----------------------------------------------------------------------");
                //ensure that data is actually modified?
                console.log("Modifying item with CaseID: " + body.OldImage.CaseID.S + " and Status: " + body.OldImage.Status.S + ". Case with CaseID: " + body.NewImage.CaseID.S + " now has Status: " + body.NewImage.Status.S);
                await createMessage(record.eventID, body.NewImage.CaseID.S, body.NewImage.Status.S).then(() => {
                    callback(null, {
                        statusCode: 201,
                        body: '',
                        headers: {
                            'Access-Control-Allow-Origin' : '*'
                        }
                    })
                }).catch((err) => {
                    console.error(err)
                });
                console.log("MODIFY -----------------------------------------------------------------------");
                break;
                
            case "REMOVE":
                console.log("REMOVE -----------------------------------------------------------------------");
                //ensure that data exists?
                console.log("Deleting item with CaseID: " + body.OldImage.CaseID.S + " and Status: " + body.OldImage.Status.S);
                await createMessage(record.eventID, body.OldImage.CaseID.S, 'REMOVED').then(() => {
                    callback(null, {
                        statusCode: 201,
                        body: '',
                        headers: {
                            'Access-Control-Allow-Origin' : '*'
                        }
                    })
                }).catch((err) => {
                    console.error(err)
                });
                console.log("REMOVE -----------------------------------------------------------------------");
                break;
            
        }
        
    }
    return `Successfully processed ${event.Records.length} records.`;
};

function createMessage(EventID, CaseID, Status){
    const params = {
        TableName: 'TargetTable',
        Item:{
            'EventID': EventID, 
            'CaseID': CaseID,
            'Status': Status
        }
    }
    return docClient.put(params).promise();
}

