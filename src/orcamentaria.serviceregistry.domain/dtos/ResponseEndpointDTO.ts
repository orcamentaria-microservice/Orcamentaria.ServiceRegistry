import HttpMethodEnum from "../enums/HttpMethodEnum";

class ResponseEndpointDTO {
    name: string;
    method: string;
    route: string;

    constructor(name: string, method: HttpMethodEnum, route: string) {
        this.name = name;
        this.method = HttpMethodEnum[method].toString();
        this.route = route;
    }
}

export default ResponseEndpointDTO;