import ResponseErrorEnum from "../enums/ResponseErrorEnum";
import ResponseError from "./ResponseError";

class ResponseModel {
    Data: any;
    Success: boolean;
    SimpleMessage?: string;
    Error?: ResponseError;

    constructor(
        data?: any,
        simpleMessage?: string,
        errorType?: ResponseErrorEnum) {
            this.Data = data;
            this.Success = !errorType;
            this.SimpleMessage = simpleMessage;
            this.Error = errorType ? new ResponseError(errorType) : undefined;
        }
}

export default ResponseModel;