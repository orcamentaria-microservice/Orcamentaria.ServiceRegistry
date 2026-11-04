import ResponseErrorEnum from "../enums/ResponseErrorEnum";
import ResponseError from "./ResponseError";

class ResponseModel {
    Data: unknown;
    Success: boolean;
    Message?: string;
    Pagination: null = null;
    Error?: ResponseError;

    constructor(
        data?: unknown,
        simpleMessage?: string,
        errorType?: ResponseErrorEnum,
        messages?: string[]) {
            this.Data = data ?? null;
            this.Success = !errorType;
            this.Message = simpleMessage;
            this.Pagination = null;
            this.Error = errorType
                ? new ResponseError(errorType, messages ?? (simpleMessage ? [simpleMessage] : []))
                : undefined;
        }
}

export default ResponseModel;
