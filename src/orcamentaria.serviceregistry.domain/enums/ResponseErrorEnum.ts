enum ResponseErrorEnum {
    Unauthorized = 401,
    NotFound = 404,
    Conflict = 409,
    ValidationFailed = 422,
    InternalError = 500,
    DatabaseError = 501,
    ExternalServiceFailure = 502,
    ServiceUnavailable = 503,
}

export default ResponseErrorEnum;