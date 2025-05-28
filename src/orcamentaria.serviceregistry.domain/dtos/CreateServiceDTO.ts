import CreateEndpointDTO from "./CreateEndpointDTO";

class CreateServiceDTO {
    name: string;
    baseUrl: string;
    port?: number;
    endpoints: CreateEndpointDTO[]
    createAt: Date;

    constructor(
      name: string, 
      baseUrl: string, 
      port: number,
      endpoints: CreateEndpointDTO[], 
      createAt: Date) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.port = port;
        this.endpoints = endpoints;
        this.createAt = createAt;
      }
}

export default CreateServiceDTO;