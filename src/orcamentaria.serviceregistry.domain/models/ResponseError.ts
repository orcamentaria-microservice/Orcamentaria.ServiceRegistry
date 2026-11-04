import ResponseErrorEnum from "../enums/ResponseErrorEnum";

class ResponseError {
    ErrorCode: ResponseErrorEnum;
    ErrorName: string;
    MessageErrors: string[];

    constructor(errorCode: ResponseErrorEnum, messages?: string[]) {
        this.ErrorCode = errorCode;
        this.ErrorName = ResponseErrorEnum[errorCode].toString();
        this.MessageErrors = messages ?? [];
    }
}

export default ResponseError;