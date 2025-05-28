import { ObjectId } from "mongodb";
import ResponseEndpointByServiceNameDTO from "./ResponseEndpointByServiceNameDTO";
import EndpointModel from "../models/EndpointModel";
import StateEnum from "../enums/StateEnum";

class ResponseServiceByServiceNameDTO {
    id: ObjectId;
    serviceName: string;
    baseUrl: string;
    port?: number;
    state: any;
    endpoints: ResponseEndpointByServiceNameDTO[]

    constructor(
        id: ObjectId,
        serviceName: string, 
        baseUrl: string, 
        state: StateEnum,
        endpoints: EndpointModel[], 
        port?: number) {
            this.id = id;
            this.serviceName = serviceName;
            this.baseUrl = baseUrl;
            this.port = port;
            this.state = { stateId: state, stateName: StateEnum[state].toString() }
            this.endpoints = endpoints?.map(i => new ResponseEndpointByServiceNameDTO(i.name, i.method, i.route));
            this.serviceName = serviceName;
    }
}

export default ResponseServiceByServiceNameDTO;