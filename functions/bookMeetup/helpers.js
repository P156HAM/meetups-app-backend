import { db } from "../../services/db";

export async function findMeetup (name) {
    try {
        const params = {
            TableName: 'meetups-db',
            IndexName: 'GSI1-name', 
            KeyConditionExpression: '#n = :name',
            ExpressionAttributeNames: {
                '#n': 'name',
            },
            ExpressionAttributeValues: {
                ':name': name,
            },
        };
        
        const result = await db.query(params).promise();
        
        if (result.Items.length > 0) {
            const meetup = result.Items[0];
            
            // Check if the meetup date has already passed
            const meetupDate = new Date(meetup.date);
            const currentDate = new Date();

            if (meetupDate < currentDate) {
                throw new Error("Meetup date has already passed. You cannot book this meetup.");
            }

            return meetup;
        } else {
            throw new Error("No meetup found with the given name");
        }
    } catch (error) {
        throw new Error(error);
    }
    
}
export async function updateMeetupAndUser(meetup, userId) {
    console.log(userId)

    // Increment registeredPeople and decrement totalTickets
    meetup.registeredPeople += 1;
    meetup.totalTickets -= 1;

    const meetupParams = {
        TableName: 'meetups-db',
        Item: meetup,
    };

    const userParams = {
        TableName: 'meetup-users-db',
        Key: {
            'PK': userId
        }
    };
    
    try {
        // Update the meetup item
        await db.put(meetupParams).promise();

        // Retrieve and update the user item
        const user = await db.get(userParams).promise();
        console.log(user.Item);
        if (user.Item) {
            // Add the updated meetup to the user's list of registered meetups
            if (!user.Item.registeredMeetups) {
                user.Item.registeredMeetups = [];
            }
            user.Item.registeredMeetups.push(meetup.name);

            // Update the user item
            console.log(user.Item);
            const updateUserParams = {
                TableName: 'meetup-users-db',
                Item: user.Item,
            };

            console.log(updateUserParams)
            const result = await db.put(updateUserParams).promise();
            console.log("updating db", result)
        }
        return 'Updated meetup and user successfully';
    } catch (error) {
        return `Error: ${error.message}`;
    }
}