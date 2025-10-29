# Orcamentaria • Service Registry (Node/TypeScript)
Um **Service Registry** leve para seu ecossistema de microsserviços. Ele registra serviços, cataloga endpoints, valida _health/heartbeat_ periodicamente e remove serviços “mortos” após um período configurável. Construído com **Express + TypeScript**, **MongoDB** e **Awilix** (DI).
> **Resumo do fluxo**
> 1) O serviço sobe e se **auto‑registra** (via `RegisterScheduler`) com `name`, `baseUrl` e a lista de endpoints.
> 2) Clientes consultam (`GET`) por nome e/ou endpoint para **descoberta** de rotas.
> 3) O serviço envia **heartbeat** periódico; se expirar (`MAX_LIFE_TIME`) ou passar do tempo de sepultamento (`BURIAL_TIME`), é marcado/removido.

---

## 🚀 Stack
- Node.js + TypeScript
- Express
- MongoDB (driver oficial)
- Awilix (Injeção de Dependência)
- JWT RS256 (validação via `public_key_service.pem`)
- dayjs, yup, cors, dotenv

---

## 📦 Estrutura (resumo)
```
.
├─ index.ts
├─ public_key_service.pem
├─ src/
│  ├─ orcamentaria.serviceregistry.api/
│  │  ├─ app.ts
│  │  ├─ di.ts
│  │  ├─ controllers/ServiceController.ts
│  │  └─ routes/ServiceRoute.ts
│  ├─ orcamentaria.serviceregistry.application/
│  │  ├─ services/ServiceService.ts
│  │  └─ schedulers/
│  ├─ orcamentaria.serviceregistry.infrastructure/
│  │  ├─ contexts/MongoContext.ts
│  │  ├─ repositories/ServiceRepository.ts
│  │  ├─ helpers/RouteHelper.ts
│  │  └─ midlewares/AuthMidleware.ts
│  └─ orcamentaria.serviceregistry.domain/
│     ├─ models/*.ts
│     ├─ dtos/*.ts
│     └─ enums/*.ts
```

---

## 🔧 Pré‑requisitos
- Node 18+
- MongoDB (Atlas ou self‑hosted)
- Chave pública RS256 do **Auth** de serviços (`public_key_service.pem`).

---

## ⚙️ Configuração (.env)
Crie um arquivo `.env` na raiz. Exemplos de variáveis usadas no código:

```dotenv
MONGO_URI=mongodb+srv://<usuario>:<senha>@<cluster>/<...>
MONGO_DB=service-registry-db
PORT=<<value>>
SELF_URL=http://localhost:3018
MAX_LIFE_TIME=1.5
BURIAL_TIME=720
```

**Observações**
- `public_key_service.pem` precisa estar na raiz do projeto (caminho lido via `process.cwd()`).
- O middleware de auth **exige** JWT RS256 com `issuer=orcamentaria.auth`, `audience=orcamentaria.service` e _claim_ `name` (nome do serviço).

---

## ▶️ Rodando localmente

```bash
npm install
npm run start:dev   # ts-node
# ou
npm run build && npm start
```

Scripts (package.json):
```json
{
  "start:dev": "ts-node index.ts",
  "start": "node dist/index.js",
  "build": "tsc -p tsconfig.json"
}
```

A aplicação inicia em: `http://localhost:${PORT||3000}`

---

## 🔐 Autenticação (serviços)
Algumas rotas pedem `Authorization: Bearer <token>` com **token de serviço** (audience `orcamentaria.service`), assinado com **RS256** pela sua Autoridade de Serviços (`orcamentaria.auth`). A validação usa `public_key_service.pem` e define `req.params.serviceName` a partir do _claim_ `name` do JWT.

---

## 🧭 Endpoints (API v1)

Base path: `/api/v1/service`

### 1) Descobrir por serviço **e** endpoint
`GET /api/v1/service/:serviceName/endpoint/:endpointName`

**Exemplo:** `GET /api/v1/service/PersonService/endpoint/GetById`

**Resposta:** `ResponseModel<ResponseServiceDTO[]>` com `baseUrl` e apenas o endpoint solicitado.

### 2) Descobrir por serviço
`GET /api/v1/service/:serviceName`

**Exemplo:** `GET /api/v1/service/PersonService`

**Resposta:** `ResponseModel<ResponseServiceDTO[]>` com todos os endpoints registrados.

### 3) Registrar serviço
`POST /api/v1/service` (⚠️ requer token de **serviço**)

**Body (CreateServiceDTO):**
```json
{
  "name": "PersonService",
  "baseUrl": "http://person.api:5000",
  "endpoints": [
    { "name": "GetById", "method": "GET", "route": "/api/v1/person/{id}" },
    { "name": "Create",  "method": "POST","route": "/api/v1/person" }
  ]
}
```
**Resposta:** `ResponseModel<string>` com o `insertedId` do serviço.

### 4) Heartbeat
`PUT /api/v1/service/heartbeat/:serviceId` (⚠️ requer token de **serviço**)

Atualiza `lastHeartbeat`. Se não encontrado: `NotFound`.

> _Schedulers_ internos:
> - **ServiceScheduler**: marca DOWN (OFFLINE) após `MAX_LIFE_TIME` e remove após `BURIAL_TIME` (min).
> - **RegisterScheduler**: auto‑registra o **Service Registry** (`name=ServiceRegistry`) e envia heartbeat a cada 30s.

---

## 🗃️ Modelo (MongoDB)

```ts
type Service = {
  _id: ObjectId;
  order: number;
  name: string;
  baseUrl: string;
  state: "STARTING" | "UP" | "DOWN";
  endpoints: Array<{ name: string; method: "GET"|"POST"|"PUT"|"DELETE"; route: string; }>;
  createAt: Date;
  lastHeartbeat: Date;
}
```

Estados evoluem conforme validação de health/tempo: `STARTING → UP → DOWN → (removido)`.

---

## 🧪 Exemplo de registro (curl)

```bash
TOKEN="<jwt_de_servico>"
curl -X POST http://localhost:$PORT/api/v1/service \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"PersonService",
    "baseUrl":"http://localhost:5001",
    "endpoints":[
      {"name":"GetById","method":"GET","route":"/api/v1/person/{id}"},
      {"name":"Create","method":"POST","route":"/api/v1/person"}
    ]
  }'
```

---

## ✨ Autor

**Marcelo Fernando**  
Desenvolvedor Fullstack | Arquitetura de Microserviços
