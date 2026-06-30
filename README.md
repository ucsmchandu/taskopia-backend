# Taskopia Backend

Taskopia Backend is the Node.js and Express API for the Taskopia marketplace. It supports Firebase based authentication, JWT cookie sessions, host and ally profiles, task posting, applications, notifications, background task lifecycle jobs, Cloudinary uploads, Redis caching, and Gemini powered AI helpers.

Taskopia has two user roles:

- **Host**: creates a business/profile page, posts tasks, reviews applicants, accepts or rejects applications, and completes or cancels tasks.
- **Ally**: creates a profile, browses active tasks, applies to tasks, tracks applications, and requests task completion.

## Tech Stack

- **Node.js 22 + Express 5** for the HTTP API
- **MongoDB + Mongoose** for persistent data
- **Redis** for profile and task response caching
- **Firebase Admin** for Firebase ID token verification
- **JWT cookies** for backend session authentication
- **Cloudinary + Multer** for image and attachment uploads
- **Node Cron** for scheduled task expiry and completion jobs
- **Google GenAI / Gemini** for AI task generation and translation
- **Docker** for containerized backend builds

## Backend Setup

### Prerequisites

- Node.js 22 or a compatible current Node.js version
- npm
- MongoDB connection string
- Redis server or Redis cloud URL
- Firebase service account JSON
- Cloudinary account
- Gemini API key

### Install Dependencies

From the backend folder:

```bash
cd taskopia-backend
npm install
```

### Environment Variables

Create a `.env` file in `taskopia-backend/`.

```env
PORT=3000
NODE_ENV=development

DBURL=mongodb_connection_string
REDIS_URL=redis_connection_string

JWT_SECRET=strong_jwt_secret

CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

FIREBASE_SERVICE_ACCOUNT_B64=base64_encoded_firebase_service_account_json

GEMINI_API=gemini_api_key
```

Notes:

- `DBURL` is required by [db.js](db.js).
- `REDIS_URL` is required by [src/config/redis.js](src/config/redis.js). If Redis cannot connect, the server exits.
- `FIREBASE_SERVICE_ACCOUNT_B64` must contain the full Firebase service account JSON encoded as base64. The code reads this value in [src/utils/firebaseAdmin.js](src/utils/firebaseAdmin.js).
- `FIREBASE_SERVICE_ACCOUNT` may exist in local env files, but the current backend code uses `FIREBASE_SERVICE_ACCOUNT_B64`.
- `GEMINI_API` is required for `/taskopia/ai/api/*` routes.
- Do not commit `.env`, Firebase service account files, Cloudinary credentials, Gemini keys, or production secrets.

### Run Locally

Start MongoDB and Redis first, then run:

```bash
npm run dev
```

For production style local execution:

```bash
npm start
```

The server starts from [index.js](index.js). The port comes from `PORT`; the current startup log always says port `3000`, so keep `PORT=3000` unless you also update that log message.

### Docker

The backend Dockerfile is in [Dockerfile](Dockerfile).

From the repository root, the existing compose file builds the backend and frontend:

```bash
docker compose up --build
```

Important: [../docker-compose.yml](../docker-compose.yml) does not start MongoDB or Redis containers. `DBURL` and `REDIS_URL` must point to reachable services from inside the backend container.

## Base URLs

Main backend API:

```text
http://localhost:3000/taskopia/u1/api
```

AI API:

```text
http://localhost:3000/taskopia/ai/api
```

CORS currently allows:

- `http://localhost:5173`
- `https://taskopia-one.vercel.app`

Cookies are sent with `credentials: true`.

## Project Structure

```text
taskopia-backend/
  db.js                         MongoDB connection
  index.js                      Express app setup, CORS, routes, Redis, cron jobs
  Dockerfile                    Backend container build
  src/
    config/redis.js             Redis client and startup connection
    controllers/                Main request handlers
    cron-jobs/                  Scheduled task state updates
    middlewares/                JWT cookie auth middleware
    models/                     Mongoose schemas and models
    routes/                     Express route definitions
    services/ai-services/       Gemini setup and AI route controllers
    utils/                      Cloudinary, Firebase, JWT, upload, notification helpers
```

## Authentication Flow

The frontend sends a Firebase ID token during registration, login, or popup auto sign-in. The backend verifies the Firebase token with Firebase Admin, creates or finds the MongoDB user, then stores a signed JWT in an HTTP-only cookie named `jwt`.

Protected routes use [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js). When the JWT is valid, the decoded payload is attached to:

```js
req.firebaseUser
```

Controllers commonly use:

- `req.firebaseUser.uid`
- `req.firebaseUser.userId`
- `req.firebaseUser.userType`

The JWT cookie is configured as:

- `httpOnly: true`
- `secure: true`
- `sameSite: "None"`
- expires in 7 days

Because `secure: true` is always enabled, browser cookie behavior may require HTTPS in non-local deployments.

## Rate Limiting and 429 Responses

The backend includes request rate limiting to protect the API from repeated bursts of traffic and repeated auth attempts.

Current rate limiter setup:

- The shared limiter is defined in [src/middlewares/rateLimiter.js](src/middlewares/rateLimiter.js).
- The global limiter is mounted in [index.js](index.js) with `app.use(rateLimiter)` so it applies to the API before the route handlers run.
- A stricter `authRateLimiter` is applied to auth-related routes in [src/routes/user.routes.js](src/routes/user.routes.js).

How the limits behave:

- The global limiter allows up to 100 requests per 15 minutes per IP.
- The auth limiter allows up to 15 auth-related requests per 15 minutes per IP.
- When the limit is exceeded, the API returns `429 Too Many Requests` with a clear JSON message.

Why this matters:

- It helps protect the app from brute-force login attempts and excessive repeated requests.
- The frontend can show a clear error so the user understands the request was blocked because of too many attempts.
- The response format is consistent and easy for the frontend to display through toast notifications or other UI feedback.

Important note:

- Because the app uses IP-based rate limiting, all requests from the same IP share the same limit window.
- If a user repeats login, register, or other rate-limited actions too quickly, they will temporarily receive the `429` response until the window resets.

## API Overview

### Auth

Mounted at `/taskopia/u1/api/auth`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Register a new user after Firebase verification |
| POST | `/login` | Login an existing user and set JWT cookie |
| POST | `/logout` | Clear JWT cookie |
| POST | `/auto/signin` | Create or login user from Firebase popup auth |
| GET | `/auth/me` | Return authenticated user metadata |
| PATCH | `/update/user` | Mark profile setup as completed |

### Host Profile

Mounted at `/taskopia/u1/api/host-profile`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload/profile` | Create host profile with profile and business images |
| GET | `/get/profile` | Get authenticated host profile |
| GET | `/get/public-profile/:publicId` | Get public host profile |
| PATCH | `/edit/profile` | Update host profile and optional images |

Upload field names:

- `userProfilePhotoUrl`
- `businessProfilePhotoUrl`

### Ally Profile

Mounted at `/taskopia/u1/api/ally-profile`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload/profile` | Create ally profile with profile photo |
| GET | `/get/profile` | Get authenticated ally profile |
| GET | `/get/public-profile/:publicId` | Get public ally profile |
| PATCH | `/edit/profile` | Update ally profile and optional profile photo |

Upload field name:

- `userProfilePhotoUrl`

### Tasks

Mounted at `/taskopia/u1/api/tasks`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload/task` | Host creates a task with optional attachment |
| GET | `/get/all/tasks` | Get all tasks |
| GET | `/get/all/active/tasks` | Get active posted tasks with optional filters |
| GET | `/get/host/tasks` | Get tasks created by authenticated host |
| GET | `/get/task/:id` | Get one task by id |
| PATCH | `/delete/task/:taskId` | Soft delete a posted task |
| PATCH | `/edit/task/:id` | Edit task fields and optional attachment |

Supported active-task query params include:

- `search`
- `sort`
- `lat`
- `lng`
- `distance`

Task upload field name:

- `attachments`

### Applications

Mounted at `/taskopia/u1/api/application/tasks`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/:taskId/apply` | Ally applies to a task |
| GET | `/:taskId/applicants` | Host gets applicants for their task |
| GET | `/applications/me` | Ally gets their applications |
| GET | `/application/details/me/:taskId` | Ally gets full details for one applied task |
| GET | `/application/:applicationId` | Ally gets one application |
| PATCH | `/application/:id/status` | Host accepts or rejects an application |
| PATCH | `/application/:id/cancel` | Ally cancels their application |
| GET | `/:taskId/my-application` | Check whether ally applied to a task |
| GET | `/:taskId/applicants/count` | Host gets applicant count |
| PATCH | `/:taskId/complete` | Host marks requested task completion as completed |
| PATCH | `/:taskId/cancel/task` | Host cancels a task |
| PATCH | `/request/task/completion/:taskId` | Ally requests task completion |

### Notifications

Mounted at `/taskopia/u1/api/notifications`.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/get/notifications` | Get recent notifications for the authenticated user |
| PATCH | `/mark/:id/read` | Mark one notification as read |
| PATCH | `/mark/all/read` | Mark all notifications as read |

## AI Features

AI routes are mounted at:

```text
http://localhost:3000/taskopia/ai/api
```

The AI service is implemented in [src/services/ai-services](src/services/ai-services). It initializes Google GenAI with `GEMINI_API` and currently calls the `gemini-3.5-flash` model.

### Generate Task Details

```text
POST /taskopia/ai/api/post-task
```

Request body:

```json
{
  "userPrompt": "I need someone to help move boxes from one apartment to another"
}
```

Success response:

```json
{
  "taskTitle": "Home Shifting Assistance",
  "taskDescription": "Need help moving household items from one home to another. Assistance with loading, unloading, and careful handling of belongings.",
  "taskBudget": 1500,
  "category": "Moving & Packing",
  "estimatedTimeHours": 4
}
```

Validation:

- Returns `400` when `userPrompt` is missing.
- Returns `500` when Gemini generation fails.
- If Gemini returns invalid JSON, the route responds with an error object and the raw AI text.

### Translate Task Description

```text
POST /taskopia/ai/api/translate-task
```

Request body:

```json
{
  "taskDescription": "Need help moving household items from one home to another.",
  "requestedLanguage": "Telugu"
}
```

Success response:

```json
{
  "translatedText": "..."
}
```

Validation:

- Returns `400` when `requestedLanguage` is missing.
- Returns `400` when `taskDescription` is missing.
- Returns `500` when Gemini translation fails.

AI implementation notes:

- Keep Gemini calls behind backend routes so the API key never reaches the frontend.
- The task generation route asks Gemini to return JSON only, then strips markdown code fences before parsing.
- The translation route returns plain translated text in `translatedText`.
- Add schema validation before saving AI generated data directly into MongoDB.

## Redis Caching

Redis is used by profile and task controllers for caching repeated reads and invalidating affected keys after writes.

Current cached areas include:

- Host profile reads
- Ally profile reads
- Task list reads
- Single task reads

Because Redis is connected during server startup, `REDIS_URL` must be configured in every environment, including Docker.

## Cron Jobs

Cron jobs run every 10 minutes from [index.js](index.js):

- [src/cron-jobs/autoCompleteTasks.js](src/cron-jobs/autoCompleteTasks.js): completes tasks in `completion_requested` state after their ending date.
- [src/cron-jobs/autoExpiresTasks.js](src/cron-jobs/autoExpiresTasks.js): expires posted tasks after `postRemovingDate`.

These jobs run inside the API process. If the backend runs multiple replicas, each replica will schedule the same jobs unless a separate worker or leader election is introduced.

## File Uploads

Uploads use Multer with Cloudinary storage configured in [src/utils/multer.js](src/utils/multer.js). Cloudinary is configured through `CLOUDINARY_URL`.

Supported upload fields:

- Host profile: `userProfilePhotoUrl`, `businessProfilePhotoUrl`
- Ally profile: `userProfilePhotoUrl`
- Task attachment: `attachments`

## Data Models

Important models live in `src/models`:

- `User`: base authenticated user and role data
- `HostProfile`: host profile, business details, and address
- `AllyProfile`: ally profile, address, rating, and contact details
- `ActiveTask`: posted tasks and task lifecycle status
- `AppliedTask`: applications, status history, and completion state
- `Notification`: ally and host notification records

## Development Notes

- Keep route files focused on URL definitions and middleware wiring.
- Keep business logic in `src/controllers`.
- Reuse `checkAuth` for protected endpoints.
- Keep secrets in `.env` only.
- Keep Cloudinary upload field names aligned with the frontend form data keys.
- Invalidate Redis cache after profile and task writes.
- Validate AI output before trusting it for persisted task data.

## Testing

The current `npm test` script is a placeholder:

```bash
npm test
```

Recommended tests to add:

- Firebase login/register flow with mocked Firebase Admin
- JWT cookie validation in `checkAuth`
- Task creation and active-task filtering
- Redis cache hit and invalidation behavior
- Application accept/reject and cancellation behavior
- Notification creation helper
- Cron job task-state transitions
- AI `/post-task` JSON parsing and validation failures
- AI `/translate-task` validation and provider failure handling

## Useful Files

- [index.js](index.js): server setup, routes, Redis startup, and cron schedules
- [db.js](db.js): MongoDB connection
- [src/config/redis.js](src/config/redis.js): Redis connection
- [src/routes/index.js](src/routes/index.js): main API route registry
- [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js): JWT authentication middleware
- [src/services/ai-services/index.js](src/services/ai-services/index.js): AI route registry
- [src/services/ai-services/controllers/post-task.js](src/services/ai-services/controllers/post-task.js): AI task-posting helper
- [src/services/ai-services/controllers/task-translate.js](src/services/ai-services/controllers/task-translate.js): AI translation helper
