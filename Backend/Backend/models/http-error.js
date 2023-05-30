// httperror extends the preexisting class error because we want to add some more functionalities to it like code part
class HttpError extends Error {
    constructor(message, errorCode) {
        // calling the constructor method of base class i.e Error inside the constructor
        // of HttpError class
        super(message);
        // adding a new property code to errorCode
        this.code = errorCode;
    }
}

module.exports = HttpError