class CreateEndpointDTO {
    name: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    route: string;

    constructor(name: string, method: "GET" | "POST" | "PUT" | "DELETE", route: string) {
        this.name = name;
        this.method = method;
        this.route = route;
    }
}

export default CreateEndpointDTO;