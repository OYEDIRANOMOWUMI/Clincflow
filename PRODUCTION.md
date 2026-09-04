# Production Checklist

## Required environment

Configure these variables for the server:

- `MONGODB_URI`: persistent MongoDB connection string
- `JWT_SECRET`: long, randomly generated secret; never use the example value
- `FRONTEND_URLS`: comma-separated frontend origins
- `DEMO_MODE=false`: keep disabled in production

Configure the frontend with:

- `VITE_API_URL`: deployed backend URL including `/api`

## Local verification

1. Start MongoDB on the configured host and port.
2. Run `node server/seedAdmin.js` from the repository root or from `server`.
3. Start the backend with `npm run server:start`.
4. Start the frontend with `npm run client:dev`.
5. Sign in with the seeded admin account and verify settings changes survive a server restart.

Run the backend regression suite with `npm run server:test` before deployment.

The server handles `SIGTERM` and `SIGINT` gracefully by closing the HTTP server and MongoDB connection before exiting.

The backend refuses to start without a database unless `DEMO_MODE=true` is explicitly set. Demo mode is for presentations and local UI work only; it is not persistent.

Use `GET /api/health` for a liveness check and `GET /api/ready` for a readiness check. Readiness returns `503` until the configured database is connected.