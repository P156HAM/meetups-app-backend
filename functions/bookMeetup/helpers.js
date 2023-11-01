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
    try {
        // Check if there are available tickets
        if (meetup.totalTickets <= 0 ) {
            throw new Error("No available tickets, better luck next time!");
        }

        meetup.registeredPeople += 1;
        meetup.totalTickets -= 1;

        const meetupParams = {
            TableName: 'meetups-db',
            Item: meetup,
        };

        const userParams = {
            TableName: 'meetup-users-db',
            Key: {
                'PK': userId,
            },
        };

        await db.put(meetupParams).promise();

        const user = await db.get(userParams).promise();

        if (user.Item) {
            if (!user.Item.registeredMeetups) {
                user.Item.registeredMeetups = [];
            }
            user.Item.registeredMeetups.push(meetup.name);

            const updateUserParams = {
                TableName: 'meetup-users-db',
                Item: user.Item,
            };

            await db.put(updateUserParams).promise();
        }
        return 'Updated meetup and user successfully';
    } catch (error) {
        return `Error: ${error.message}`;
    }
}