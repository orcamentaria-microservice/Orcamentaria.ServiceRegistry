import { Router, RequestHandler } from "express";
import RouteCatalogService from "./RouteCatalogHelper";
import ServiceRouteModel from "../../orcamentaria.serviceregistry.domain/models/ServiceRouteModel";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";

function CreateNamedRoutes(
  router: Router,
  serviceRoute: ServiceRouteModel
) {

  serviceRoute.endpoints.forEach(item => {
    if(item.middleware)
      (router as any)[HttpMethodEnum[item.method].toString().toLowerCase()](item.route, item.middleware, item.action);
    else
      (router as any)[HttpMethodEnum[item.method].toString().toLowerCase()](item.route, item.action);
});

  RouteCatalogService.add(serviceRoute);
}

export { CreateNamedRoutes };
