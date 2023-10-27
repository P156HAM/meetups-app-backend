const middy = require('@middy/core');
const { validateToken } = require("../../middlewares/auth");
const { findMeetup } = require("../bookMeetup/helpers");
const { sendResponse, sendError } = require("../../responses");
const { validateFeedbackInput } = require('../../middlewares/bodyValidation');
const { updateFeedback, findUser } = require('./helpers');

exports.handler = middy()
    .handler(async (event) => {
        try {
            if (!event?.userId || (event?.error && event?.error === "401")) {
                return sendError(401, { message: "Please provide a valid token." })
            } else if (event.error) {
                return sendError(event.error.statusCode, { message: event.error.message, details: event.error.details });
            }

            const { name, feedback, rating } = JSON.parse(event.body);
            const meetup = await findMeetup(name);
            const userId = event.userId

            const user = await findUser(userId);
            await updateFeedback(meetup, feedback, rating, user);

            return sendResponse(200, { success: true, message: "Your feedback is registered" });
        } catch (error) {
            return sendError(400, { message: error.message });
        }
    })
    .use(validateToken)
    .use(validateFeedbackInput);