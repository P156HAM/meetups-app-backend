const middy = require('@middy/core');
import { validateToken } from "../../middlewares/auth";
import { validateMeetupInput } from "../../middlewares/bodyValidation";
import { sendResponse } from "../../responses/index.js";
import { sendError } from "../../responses/index.js";
import { findMeetup, updateMeetupAndUser } from "./helpers";

exports.handler = middy()
    .handler(async(event) => {
        try {
            
            if(!event?.userId || (event?.error && event?.error === "401")) {
                return sendError(401, { message: "Please provide a valid token."})
            } else if (event.error) {
                return sendError(event.error.statusCode, { message: event.error.message, details: event.error.details });
            }
            const { name } = JSON.parse(event.body);
            const userId = event.userId

            try {
                const meetup = await findMeetup(name);
                const updatedMeetup = await updateMeetupAndUser(meetup, userId);
                return sendResponse(200, { success: true, updatedMeetup });
            } catch (error) {
                return sendError(404, { message: error.message });
            }

        } catch (error) {
            return sendError(400, { message: error.message })
        }
    })
    .use(validateToken)
    .use(validateMeetupInput)