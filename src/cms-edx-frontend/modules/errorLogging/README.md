# SigNoz front-end telemetry (Teacher LMS)

Browser exports OTLP to **same-origin** `/otel/v1/logs` and `/otel/v1/traces`.
The collector (`https://otel.compugrade.com`) has **no CORS** — never call it from the browser with a bearer token.

## Env (`.env` / `.env.development` / CI)

```bash
SIGNOZ_OTLP_ENDPOINT=https://otel.compugrade.com
SIGNOZ_OTLP_PROXY_PATH=/otel
OTEL_SERVICE_NAME=lms-frontend
OTEL_DEPLOYMENT_ENVIRONMENT=development   # staging | production
# Proxy/server only — never put this in src/compugrade-constants.js:
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Bearer%<URL-ENCODED-TOKEN>
```

`webpack.otel.js` sets `SIGNOZ_ERROR_LOGGING=true` in the bundle when `SIGNOZ_OTLP_ENDPOINT` is set.
Dev server proxies `/otel` → the collector and injects auth headers from `OTEL_EXPORTER_OTLP_HEADERS`.

OpenTelemetry packages are pinned to a peer-compatible set (`api@1.9.1` + sdk/exporters `@0.203.0` / `@2.0.1`) so Tutor’s
`npm clean-install` succeeds without `--legacy-peer-deps` (Docker only copies `package.json` + `package-lock.json`, not `.npmrc`).

## Production (EC2 / nginx)

Place **above** the SPA catch-all (example):

```nginx
location /otel/ {
  proxy_pass https://otel.compugrade.com/;
  proxy_set_header Host otel.compugrade.com;
  proxy_set_header Authorization "Bearer <TOKEN>";
  proxy_ssl_server_name on;
}
```

Token must come from host secrets / `deploy_cms_frontend.sh` env — **not** from the JS bundle or `compugrade-constants.js`.

## Identity

`sessionStorage.user_id` is set to the LMS account **numeric `id`** from
`GET {LMS_BASE_URL}/api/user/v1/accounts/{username}` (username is only used to call the API — never stored as `user.id`).
