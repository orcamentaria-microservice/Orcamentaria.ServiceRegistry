import express from "express";
import { AwilixContainer } from "awilix";
import { setupContainer } from "./di";
import createServiceRoutes from "./routes/ServiceRoute";
import ServiceController from "./controllers/ServiceController";
import ServiceScheduler from "../orcamentaria.serviceregistry.application/schedulers/ServiceScheduler";
import AuthMiddleware from "../orcamentaria.serviceregistry.infrastructure/midlewares/AuthMidleware";
import RegisterScheduler from "../orcamentaria.serviceregistry.application/schedulers/RegisterScheduler";

export async function createApp(injectedContainer?: AwilixContainer) {
  const app = express();
  app.use(express.json());

  const isTest = injectedContainer !== undefined;
  const container = isTest ? injectedContainer : await setupContainer();

  const resolvedContainer = {
    serviceController: container.resolve<ServiceController>("serviceController"),
    serviceScheduler: container.resolve<ServiceScheduler>("serviceScheduler"),
    registerScheduler: container.resolve<RegisterScheduler>("registerScheduler"),
    authMiddleware: container.resolve<AuthMiddleware>("authMiddleware"),
  };

  if (!isTest) {
    resolvedContainer.serviceScheduler.healthServiceValidate(
      process.env.MAX_LIFE_TIME as unknown as number || 1.5
    );
    resolvedContainer.serviceScheduler.removeServices(
      process.env.BURIAL_TIME as unknown as number || 720
    );
    resolvedContainer.registerScheduler.startAsync({
      name: "ServiceRegistry",
      baseUrl: process.env.SELF_URL ?? `http://localhost:${process.env.PORT}`,
    });
  }

  const serviceRoutes = createServiceRoutes(resolvedContainer);
  app.use("/api/v1/service", serviceRoutes);

  return app;
}
