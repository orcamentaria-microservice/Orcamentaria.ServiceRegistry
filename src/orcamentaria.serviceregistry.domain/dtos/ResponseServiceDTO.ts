import { ObjectId } from "mongodb";
import ResponseEndpointDTO from "./ResponseEndpointDTO";
import EndpointModel from "../models/EndpointModel";
import StateEnum from "../enums/StateEnum";

class ResponseServiceDTO {
    id: ObjectId;
    order: number;
    serviceName: string;
    baseUrl: string;
    state: any;
    endpoints: ResponseEndpointDTO[]

    constructor(
        id: ObjectId,
        order: number,
        serviceName: string, 
        baseUrl: string, 
        state: StateEnum,
        endpoints: EndpointModel[]) {
            this.id = id;
            this.order = order;
            this.serviceName = serviceName;
            this.baseUrl = baseUrl;
            this.state = { stateId: state, stateName: StateEnum[state].toString() }
            this.endpoints = endpoints?.map(i => new ResponseEndpointDTO(i.name, i.method, i.route));
            this.serviceName = serviceName;
    }
}

export default ResponseServiceDTO;