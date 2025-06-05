import { ObjectId } from "mongodb";
import StateEnum from "../enums/StateEnum";
import EndpointModel from "./EndpointModel";

class ServiceModel {
    _id?: ObjectId;
    order: number;
    name: string;
    baseUrl: string;
    state: StateEnum
    endpoints: EndpointModel[]
    createAt: Date;
    lastHeartbeat: Date; 

    constructor(
      name: string, 
      order: number,
      baseUrl: string, 
      state: StateEnum, 
      endpoints: EndpointModel[], 
      createAt: Date,
      lastHeartbeat: Date) {
        this.name = name;
        this.order = order;
        this.baseUrl = baseUrl;
        this.state = state;
        this.endpoints = endpoints;
        this.createAt = createAt;
        this.lastHeartbeat = lastHeartbeat;
      }
}

export default ServiceModel;