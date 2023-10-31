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

            if (meetupDate > currentDate) {
                throw new Error("Meetup date has not passed. You cannot send feedback yet.");
            }

            return meetup;
        } else {
            throw new Error("No meetup found with the given name");
        }
    } catch (error) {
        throw new Error(error);
    } 
}
export async function updateFeedback(meetup, feedback, rating, user) {
    const feedbackToSend = {
        name: user.Item.userName,
        rating: rating,
        feedback: feedback
    }

    console.log(feedbackToSend)

    const meetupParams = {
        TableName: 'meetups-db',
        Key: {
            'PK': meetup.PK,
            'SK': meetup.SK,
        },
        UpdateExpression: 'SET #feedbacks = list_append(if_not_exists(#feedbacks, :empty_list), :feedback)',
        ExpressionAttributeNames: {
            '#feedbacks': 'feedbacks',
        },
        ExpressionAttributeValues: {
            ':feedback': [feedbackToSend],
            ':empty_list': [],
        },
    };

    const meetupDate = new Date(meetup.date);
    const currentDate = new Date();

    if (meetupDate < currentDate) {
        await db.update(meetupParams).promise();
    } else {
        throw new Error("Meetup date has not passed. You cannot leave a feedback yet.");
    }
}
