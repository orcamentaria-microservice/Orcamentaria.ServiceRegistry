import { Router, RequestHandler } from "express";
import RouteCatalogService from "./RouteCatalogHelper";
import ServiceRouteModel from "../../orcamentaria.serviceregistry.domain/models/ServiceRouteModel";
import HttpMethodEnum from "../../orcamentaria.serviceregistry.domain/enums/HttpMethodEnum";

type RouterMethod = (path: string, ...handlers: RequestHandler[]) => void;

function CreateNamedRoutes(
  router: Router,
  serviceRoute: ServiceRouteModel
) {
  const routerRecord = router as unknown as Record<string, RouterMethod>;

  serviceRoute.endpoints.forEach(item => {
    const method = HttpMethodEnum[item.method].toString().toLowerCase();
    if (item.middleware)
      routerRecord[method](item.route, item.middleware as RequestHandler, item.action!);
    else
      routerRecord[method](item.route, item.action!);
  });

  RouteCatalogService.add(serviceRoute);
}

export { CreateNamedRoutes };
