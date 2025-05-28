import "dotenv/config";
import { createApp } from "./src/orcamentaria.serviceregistry.api/app";

(async () => {
  const app = await createApp();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();