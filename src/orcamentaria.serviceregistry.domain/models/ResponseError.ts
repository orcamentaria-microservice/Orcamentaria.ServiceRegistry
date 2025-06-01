import ResponseErrorEnum from "../enums/ResponseErrorEnum";

class ResponseError {
    ErrorCode: ResponseErrorEnum;
    ErrorName: string;

    constructor(errorCode: ResponseErrorEnum) {
        this.ErrorCode = errorCode;
        this.ErrorName = ResponseErrorEnum[errorCode].toString();
    }
}

export default ResponseError;