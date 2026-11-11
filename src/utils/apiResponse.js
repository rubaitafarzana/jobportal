const apiResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({ message,  success: statusCode < 400 ? true : false,data })
}

module.exports = apiResponse;