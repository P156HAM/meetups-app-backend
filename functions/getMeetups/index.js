import { sendError, sendResponse } from "../../responses";
import { db } from "../../services/db";

exports.handler = async (event) => {
    try {
        
        const params = {
            TableName: 'meetups-db',
            FilterExpression: 'begins_with(PK, :pk)',
            ExpressionAttributeValues: {
                ':pk': 'MEETUP',
            },
        };
        
        const meetups = await db.scan(params).promise();

        return sendResponse(200, meetups.Items);
    } catch (error) {
        return sendError(400, { error: error.message });
    }
};
