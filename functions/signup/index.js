const middy = require('@middy/core');
import { bcryptPassword, addUser } from "./helpers.js";
const { v4: uuidv4 } = require('uuid');
import { sendResponse } from "../../responses/index.js";
import { sendError } from "../../responses/index.js";
import { validateUserInput } from "../../middlewares/bodyValidation.js";

exports.handler = middy()
    .handler(async (event) => {
        try {

            if (event.error) {
                return sendError(event.error.statusCode, { message: event.error.message, details: event.error.details });
            }
            
            const userID = uuidv4()
            const { userName, password, email } = JSON.parse(event.body)
            const hashedPassword = await bcryptPassword(password, userName)
            const newUser = await addUser(userID, userName, hashedPassword, email)
    
            return sendResponse(200, {sucess: true, newUser})
        } catch (error) {
            return sendError(400, { message: error.message })
        }
    })
    .use(validateUserInput)
  