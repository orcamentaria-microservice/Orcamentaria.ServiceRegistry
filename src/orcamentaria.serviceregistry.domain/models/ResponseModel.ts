import ResponseErrorEnum from "../enums/ResponseErrorEnum";

class ResponseModel {
    status: number;
    success: boolean;
    data: any;
    errorType?: string;
    error?: string;

    constructor(
        data?: any,
        errorType?: ResponseErrorEnum,
        error?: string) {
            this.data = data;
            this.status = errorType || 200;
            this.success = !errorType;
            this.errorType = errorType ? ResponseErrorEnum[errorType].toString() : undefined
            this.error = error;
        }
}

export default ResponseModel;