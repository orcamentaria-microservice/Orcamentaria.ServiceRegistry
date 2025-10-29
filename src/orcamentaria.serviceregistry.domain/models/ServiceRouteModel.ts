import EndpointModel from "./EndpointModel";

class ServiceRouteModel { 
    name: string;
    route: string;
    endpoints: EndpointModel[]

    constructor(
        name: string, 
        route: string,
        endpoints: EndpointModel[]) {
        this.name = name;
        this.route = route;
        this.endpoints = endpoints;
    }
};

export default ServiceRouteModel;