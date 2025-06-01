import CreateEndpointDTO from "./CreateEndpointDTO";

class CreateServiceDTO {
    name: string;
    baseUrl: string;
    endpoints: CreateEndpointDTO[]
    createAt: Date;

    constructor(
      name: string, 
      baseUrl: string, 
      endpoints: CreateEndpointDTO[], 
      createAt: Date) {
        this.name = name;
        this.baseUrl = baseUrl;
        this.endpoints = endpoints;
        this.createAt = createAt;
      }
}

export default CreateServiceDTO;