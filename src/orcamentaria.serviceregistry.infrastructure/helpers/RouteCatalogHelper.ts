import ServiceRouteModel from "../../orcamentaria.serviceregistry.domain/models/ServiceRouteModel";

class RouteCatalogService {
  private static _items: ServiceRouteModel[] = [];

  static add(serviceRoute: ServiceRouteModel) { this._items.push(serviceRoute); }
  
  static list(owner: string) { return this._items.slice().filter(x => x.name == owner); }

  static listAll() { return this._items.slice(); }

}
export default RouteCatalogService;