const middy = require('@middy/core');
import { createToken } from "../../middlewares/auth.js";
import { validateUserInputLogin } from "../../middlewares/bodyValidation.js";
const { validateUser } = require("./helpers");
import { sendResponse } from "../../responses/index.js";
import { sendError } from "../../responses/index.js";

exports.handler = middy()
    .handler(async (event) => {
        try {
            // Check if the event has a validation error response
            if (event.error) {
                return sendError(event.error.statusCode, {
                  message: event.error.message,
                  details: event.error.details
                });
            }

            const { userName, password } = JSON.parse(event.body);
            const { user, isPasswordValid } = await validateUser(userName, password);

            if (isPasswordValid && user) {
                const token = await createToken(user.userName, user.PK);
                return sendResponse(200, { success: true, token: token });
            } else {
                return sendError(401, { success: false, message: "Invalid credentials" });
            }
    
        } catch (error) {
            return sendError(400, { message: error.message });
        }
    })
    .use(validateUserInputLogin);