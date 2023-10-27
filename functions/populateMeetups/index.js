import { sendError, sendResponse } from "../../responses/index.js";
import { db } from "../../services/db.js";
import { meetups } from "./helpers.js";
exports.handler = async (event) => {
        try {
            const tableName = 'meetups-db';

            const batchWriteParams = {
                RequestItems: {
                  [tableName]: meetups.map((meetup) => ({
                    PutRequest: {
                      Item: meetup,
                    },
                  })),
                },
              };

              await db.batchWrite(batchWriteParams, (err, data) => {
                if (err) {
                  console.log("Unable to insert items. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Inserted items:", JSON.stringify(data, null, 2));
                }
              }).promise();
              
            return sendResponse(200, "Inserted items:", JSON.stringify(data, null, 2))
            
        } catch (error) {
            return sendError(400, { message: error.message })
        }
    }