import { DynamoDBClient, ScanCommand, GetItemCommand, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });

export const handler = async (event, context, callback) => {
    const superA :  string = 'superA'
    const superB :  string = 'superB'
    const superC :  string = 'superC'
    const superD :  string = 'superD'
    // Mở Cloudwatch log lên để kiểm tra log
    console.log("Xuat log vao cloudwatch");

    // Sử dụng biến process.env.DYNAMODB_TRANING get lambda config DYNAMODB_TRANING
    const tableName = process.env.DYNAMODB_TRANING;
    console.log("tableName", tableName);

    // Viết code để scan toàn bộ data trong DYNAMODB_TRANING
    const command = new ScanCommand({
        TableName: tableName
    });

    const response = await ddbClient.send(command);

    console.log("Scan DYNAMODB_TRANING successful:", response.Items);
    
    // Viết code để get data trong DYNAMODB_TRANING theo hash key
    const id = event.id;
    const sort = event.sort;
  
    if (id || sort || id ==! undefined || sort ==! undefined) {
        const params = {
            TableName: process.env.DYNAMODB_TRANING,
             Key: {
                id: { S: id },
                sort: { N: sort.toString() }
            }
        };

        const data = await ddbClient.send(new GetItemCommand(params));
        if (!data.Item) {
            return `Item of id ${id} not found`;
        }
        else {
            console.log("Get by hash key DYNAMODB_TRANING successful:", data.Item);
        }
    }
   
    // Viết code để insert/update data trong DYNAMODB_TRANING
    // Insert flow
    const {insertedId, insertedSort, insertedFullName} = event;
    if (insertedId || insertedSort || insertedFullName) {
        const insertedParams = {
            TableName: process.env.DYNAMODB_TRANING, // Environment variable
            Item: {
                id: { S: insertedId },    
                sort: { N: insertedSort.toString() },
                fullName: { S: insertedFullName } 
            }
        };
        await ddbClient.send(new PutItemCommand(insertedParams));
        console.log("Item inserted successfully.");
    }

    // Update flow
    const {updatedId, updatedSort, updatedFullName} = event;
    if (updatedId || updatedSort || updatedFullName) {
        const updatedParams = {
            TableName: process.env.DYNAMODB_TRANING, // Environment variable
            Key: {
                id: { S: updatedId },
                sort: { N: updatedSort.toString() }
            },
            UpdateExpression: "set fullName = :fullName",
            ExpressionAttributeValues: {
                ":fullName": { S: updatedFullName }
            },
            ReturnValues: "ALL_NEW"
        };
        const updatedData = await ddbClient.send(new UpdateItemCommand(updatedParams));
        console.log("Item updated successfully.", updatedData);
    }
    // Ghi chú: Có thể sử dụng cloudwatch log để kiểm tra lỗi

    return "ALL DONE";
};
