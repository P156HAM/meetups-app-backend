const middy = require('@middy/core');
import { validateToken } from "../../middlewares/auth";
import { sendResponse } from "../../responses/index.js";
import { sendError } from "../../responses/index.js";
import { findUser } from "./helpers";

exports.handler = middy()
    .handler(async(event) => {
        try {
            
            if(!event?.userId || (event?.error && event?.error === "401")) {
                return sendError(401, { message: "Please provide a valid token."})
            } else if (event.error) {
                return sendError(event.error.statusCode, { message: event.error.message, details: event.error.details });
            }
            const userId = event.userId

            const user = await findUser(userId);
            return sendResponse(200, { success: true, user });
        } catch (error) {
            return sendError(400, { message: error.message })
        }
    })
    .use(validateToken)