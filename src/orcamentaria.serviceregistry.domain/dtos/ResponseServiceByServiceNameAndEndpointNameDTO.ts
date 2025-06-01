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
        state: StateEnum){
            this.id = id;
            this.serviceName = serviceName;
            this.endpointName = endpointName;
            this.url = this.urlMount(baseUrl, route);
            this.method = HttpMethodEnum[method].toString();
            this.state = { stateId: state, stateName: StateEnum[state].toString() }
    }

    private urlMount (baseUrl: string, route: string) : string {

        if(!route.match(/^\/.*/))
            route = `/${route}`;

        if(!baseUrl.match(/\/$/))
            baseUrl = baseUrl.replace(/\/+$/, '');

        return `${baseUrl}${route}`;
    }
}

export default ResponseServiceByServiceNameAndEndpointNameDTO;