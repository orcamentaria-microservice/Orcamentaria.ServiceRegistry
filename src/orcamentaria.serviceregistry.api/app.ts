import express from "express";
import bodyParser from "body-parser";
import { setupContainer } from "./container";
import createServiceRoutes from "./routes/ServiceRoute";
import ServiceController from "./controllers/ServiceController";
import ServiceScheduler from "../orcamentaria.serviceregistry.application/schedulers/ServiceScheduler";
import AuthMiddleware from "../orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";

export async function createApp() {
  const app = express();
  app.use(bodyParser.json());

  const container = await setupContainer();

  const resolvedContainer = {
    serviceController: await container.resolve<ServiceController>("serviceController"),
    serviceScheduler: await container.resolve<ServiceScheduler>("serviceScheduler"),
    authMiddleware: await container.resolve<AuthMiddleware>("authMiddleware"),
  };

  resolvedContainer.serviceScheduler.healthServiceValidate(process.env.MAX_LIFE_TIME as unknown as number || 1.5);
  resolvedContainer.serviceScheduler.removeServices(process.env.BURIAL_TIME as unknown as number || 720);

  app.use("/v1/service", createServiceRoutes(resolvedContainer));

  return app;
}