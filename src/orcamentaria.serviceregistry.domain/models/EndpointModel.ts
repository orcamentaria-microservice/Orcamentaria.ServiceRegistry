import HttpMethodEnum from "../enums/HttpMethodEnum";

class EndpointModel {
    name: string;
    method: HttpMethodEnum;
    route: string;

    constructor(name: string, method: HttpMethodEnum, route: string) {
        this.name = name;
        this.method = !method ? HttpMethodEnum.INVALID : method;
        this.route = route;
    }
}

export default EndpointModel;