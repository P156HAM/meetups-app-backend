import { db } from "../../services/db.js";
const bcrypt = require('bcryptjs');

export async function validateUser(userName, providedPassword) {
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
        const storedPassowrd = userExist.Items[0].password

        const isPasswordValid = bcrypt.compare(providedPassword, storedPassowrd)

        if(isPasswordValid) {
            return userExist.Items[0];
        }
    } else {
        throw new Error("Unauthorized")
    }
}