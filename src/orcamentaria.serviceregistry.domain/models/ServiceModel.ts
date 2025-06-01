import { ObjectId } from "mongodb";
import StateEnum from "../enums/StateEnum";
import EndpointModel from "./EndpointModel";
import { Dayjs } from "dayjs";

class ServiceModel {
    _id?: ObjectId;
    name: string;
    baseUrl: string;
    state: StateEnum
    endpoints: EndpointModel[]
    createAt: Date;
    lastHeartbeat: Date; 

    constructor(
      name: string, 
      baseUrl: string, 
      state: StateEnum, 
      endpoints: EndpointModel[], 
      createAt: Date,
      lastHeartbeat: Date) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.state = state;
        this.endpoints = endpoints;
        this.createAt = createAt;
        this.lastHeartbeat = lastHeartbeat;
      }
}

export default ServiceModel;