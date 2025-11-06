import ResponseErrorEnum from "../enums/ResponseErrorEnum";
import ResponseError from "./ResponseError";

class ResponseModel {
    Data: any;
    Success: boolean;
    Message?: string;
    Error?: ResponseError;

    constructor(
        data?: any,
        simpleMessage?: string,
        errorType?: ResponseErrorEnum) {
            this.Data = data;
            this.Success = !errorType;
            this.Message = simpleMessage;
            this.Error = errorType ? new ResponseError(errorType) : undefined;
        }
}

export default ResponseModel;