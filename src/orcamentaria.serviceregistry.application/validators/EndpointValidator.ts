import { ObjectSchema, mixed, object, string } from "yup";
import EndpointModel from "../../orcamentaria.serviceregistry.domain/models/EndpointModel";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";

class EndpointValidator {

    private schema: ObjectSchema<{}, EndpointModel, {}, "">;

    constructor() {
        this.schema = object<EndpointModel>({
            name: string().required("O nome do endpoint deve ser informado."),
            route: string().required("A rota do endpoint deve ser informada."),
            method: mixed<HttpMethodEnum>()
                    // .oneOf(Object.values(HttpMethodEnum).filter(v => typeof v === 'number' && v !== HttpMethodEnum.INVALID) as HttpMethodEnum[], "O método HTTP é inválido ou deve ser informado.")
                    .required("O método HTTP do endpoint deve ser informado."),
        });
    }

    async validateBeforeInsert(entity: EndpointModel): Promise<string | undefined> {
        try {
            await this.schema.validate(entity);
        } catch (error: any) {
            return error.errors[0];
        }
    }
}

export default EndpointValidator;