import { db } from "../../services/db.js";
const bcrypt = require('bcryptjs');

export async function validateUser(userName, password) {
   const userExist = await db.scan({
        TableName: "meetup-users-db",
        FilterExpression: "#userName = :userName",
        ExpressionAttributeNames: {
            "#userName": "userName",
        },
        ExpressionAttributeValues: {
            ":userName": userName,
        }
    }).promise();

    if (userExist.Items && userExist.Items.length > 0) {
        const storedPassword = userExist.Items[0].password
        const isPasswordValid = await bcrypt.compare(password, storedPassword);

        if (isPasswordValid) {
            return { user: userExist.Items[0], isPasswordValid: true };
        }
    }
    
    return { user: null, isPasswordValid: false };
}