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
                throw new Error("Meetup date has already passed. You cannot delete this meetup.");
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
        // Retrieve and update the user item
        const userParams = {
            TableName: 'meetup-users-db',
            Key: {
                'PK': userId
            }
        };

        const user = await db.get(userParams).promise();
        const removedMeetups = user.Item.registeredMeetups.filter((meetupName) => {
            return meetupName === meetup.name;
        });
        
        if (meetup.registeredPeople <= 0 ) {
            throw new Error("You have no tickets!");
        }
        // Increment registeredPeople and decrement totalTickets
        meetup.registeredPeople -= removedMeetups.length;
        meetup.totalTickets += removedMeetups.length;
    
        const meetupParams = {
            TableName: 'meetups-db',
            Item: meetup,
        };

        // Update the meetup item
        await db.put(meetupParams).promise();

        console.log(user.Item);
        if (user.Item) {

            user.Item.registeredMeetups = user.Item.registeredMeetups.filter(
                (meetupName) => meetupName !== meetup.name
            )

            const updateUserParams = {
                TableName: 'meetup-users-db',
                Item: user.Item,
            };

            await db.put(updateUserParams).promise();
        }
        return 'You are now unregistered successfully';
    } catch (error) {
        return `Error: ${error.message}`;
    }
}