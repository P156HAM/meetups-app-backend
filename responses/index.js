export function sendResponse(code, response) {
    return {
        statusCode: code,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(response)
    }
}

export function sendError(errorCode, message) {
    return {
        statusCode: errorCode,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message)
    }
}