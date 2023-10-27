const jwt = require('jsonwebtoken');

export async function createToken (userName, userId) {
    const token = jwt.sign({ userName: userName, userId: userId }, 'key441144', { expiresIn: 2000 })

    return token;
}

export const validateToken = {
    before: async (request) => {
        try {
            const token = request.event.headers.authorization.replace('Bearer', '').trim();
            if (!token) {
                return {
                    statusCode: 401,
                    body: JSON.stringify({ message: 'Unauthorized, please provide a token.' })
                };
            } else {
                const data = jwt.verify(token, 'key441144')
                request.event.username = data.userName
                request.event.userId = data.userId
                return request.response
            }
        } catch (error) {
            request.event.error = '401';
            return request.response;
        }
    }
}