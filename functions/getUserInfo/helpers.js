import { db } from "../../services/db";

export async function findUser(userId) {
    const userParams = {
        TableName: 'meetup-users-db',
        Key: {
            'PK': userId
        }
    };

    const user = await db.get(userParams).promise();
    console.log(user);

    return user;
}