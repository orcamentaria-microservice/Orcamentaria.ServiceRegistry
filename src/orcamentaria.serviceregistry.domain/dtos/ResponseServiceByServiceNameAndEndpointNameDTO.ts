import { ObjectId } from "mongodb";
import HttpMethodEnum from "../enums/HttpMethodEnum";
import StateEnum from "../enums/StateEnum";

class ResponseServiceByServiceNameAndEndpointNameDTO {
    id: ObjectId;
    serviceName: string;
    endpointName: string;
    url: string;
    method: string;
    state: any;

    constructor(
        id: ObjectId,
        serviceName: string, 
        endpointName: string, 
        baseUrl: string, 
        route: string,
        method: HttpMethodEnum,
        state: StateEnum,
        port?: number){
            this.id = id;
            this.serviceName = serviceName;
            this.endpointName = endpointName;
            this.url = this.urlMount(baseUrl, route, port);
            this.method = HttpMethodEnum[method].toString();
            this.state = { stateId: state, stateName: StateEnum[state].toString() }
    }

    private urlMount (baseUrl: string, route: string, port?: number) : string {

        if(!route.match(/^\/.*/))
            route = `/${route}`;

        if(!baseUrl.match(/\/$/))
            baseUrl = baseUrl.replace(/\/+$/, '');

        if(!!port)
            return `${baseUrl}:${port}${route}`;

        return `${baseUrl}${route}`;

    }
}

export default ResponseServiceByServiceNameAndEndpointNameDTO;