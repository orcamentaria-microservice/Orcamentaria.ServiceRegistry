import { ObjectSchema, array, date, mixed, number, object, string } from "yup";
import ServiceModel from "../../orcamentaria.serviceregistry.domain/models/ServiceModel";
import StateEnum from "../../orcamentaria.serviceregistry.domain/enums/StateEnum";

class ServiceValidator {

    private schema: ObjectSchema<{}, ServiceModel, {}, "">;

    constructor() {
        this.schema = object<ServiceModel>({
            name: string().required(),
            baseUrl: string().required(),
            state: mixed<StateEnum>()
                    .oneOf(Object.values(StateEnum).filter(v => typeof v === 'number') as StateEnum[])
                    .required()
        });
    }

    async validateBeforeInsert(entity: ServiceModel): Promise<undefined | string> {
        try {
            await this.schema.validate(entity);
        } catch (error: any) {
            return error.errors[0];
        }
    }
}

export default ServiceValidator;