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
        if (meetup.registeredPeople <= 0 ) {
            throw new Error("You have no tickets!");
        }
        // Increment registeredPeople and decrement totalTickets
        meetup.registeredPeople -= 1;
        meetup.totalTickets += 1;
    
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
        // Update the meetup item
        await db.put(meetupParams).promise();

        // Retrieve and update the user item
        const user = await db.get(userParams).promise();
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

            // // Find the index of the element to remove
            // const indexToRemove = user.Item.registeredMeetups.indexOf(meetup.name);

            // // Check if the element is in the array
            // if (indexToRemove !== -1) {
            // // Use splice to remove the element at the found index
            // user.Item.registeredMeetups.splice(indexToRemove, 1);
            // } else {
            //     throw new Error("You are not registered in this meetup")
            // }