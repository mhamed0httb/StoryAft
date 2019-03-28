const responseModel = function(success, msg, data) {
    const response = {
        success: success,
        message: msg,
        data: data
    };
    return response;
}; 

module.exports = responseModel;