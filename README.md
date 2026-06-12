# Taskopia Backend

Taskopia Backend is the Express API for the Taskopia marketplace. It handles user authentication, host and ally profiles, task posting, task applications, notifications, scheduled task updates, file uploads, and AI-assisted task posting.

Taskopia has two main user roles:

- **Host**: creates a profile, posts tasks, reviews applicants, accepts or rejects applications, and completes or cancels tasks.
- **Ally**: creates a profile, browses active tasks, applies to tasks, tracks applications, and requests task completion.

## Tech Stack

- **Node.js + Express** for the HTTP API
- **MongoDB + Mongoose** for database models
- **Firebase Admin** for Firebase token verification
- **JWT cookies** for backend session authentication
- **Cloudinary + Multer** for profile and task attachment uploads
- **Node Cron** for scheduled task expiry and completion jobs
- **Google GenAI** for AI task-posting assistance

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB connection string
- Firebase service account credentials
- Cloudinary account, if file uploads are enabled
- Gemini API key, if AI task helper is enabled

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend root.

```env
PORT=3000
DBURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
FIREBASE_SERVICE_ACCOUNT_B64=base64_encoded_firebase_service_account_json
GEMINI_API=your_gemini_api_key
```

Do not commit `.env`, service account files, API keys, or production secrets.

### Run Server

```bash
npm start
```

The server starts from [index.js](index.js). The main API is mounted at:

```text
/taskopia/u1/api
```

The AI API is mounted separately at:

```text
/taskopia/ai/api
```

## Project Structure

```text
taskopia-backend/
  db.js                         MongoDB connection
  index.js                      Express app setup, CORS, routes, cron jobs
  src/
    controllers/                Request handlers and business logic
    cron-jobs/                  Scheduled task state updates
    middlewares/                Authentication middleware
    models/                     Mongoose schemas and models
    routes/                     Express route definitions
    services/ai-services/       AI task helper routes and model setup
    utils/                      Cloudinary, Firebase, JWT, notification helpers
```

## Authentication Flow

The frontend sends a Firebase ID token to the backend during login, registration, or automatic sign-in. The backend verifies that token with Firebase Admin, creates or finds the matching MongoDB user, then stores a signed JWT in an HTTP-only cookie named `jwt`.

Protected routes use [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js). When the JWT is valid, the decoded user data is attached to:

```js
req.firebaseUser
```

Most protected controllers use `req.firebaseUser.uid`, `req.firebaseUser.userId`, and `req.firebaseUser.userType` to find the correct user, profile, or task owner.

## API Overview

### Base URL

```text
http://localhost:3000/taskopia/u1/api
```

### Auth

Mounted at `/auth`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/register` | Register a new user after Firebase verification |
| POST | `/login` | Login existing user and set JWT cookie |
| POST | `/logout` | Clear JWT cookie |
| POST | `/auto/signin` | Create or login user from Firebase popup auth |
| GET | `/auth/me` | Return authenticated user metadata |
| PATCH | `/update/user` | Mark profile setup as completed |

### Host Profile

Mounted at `/host-profile`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload/profile` | Create host profile with profile and business images |
| GET | `/get/profile` | Get authenticated host profile |
| GET | `/get/public-profile/:publicId` | Get public host profile |
| PATCH | `/edit/profile` | Update host profile and optional images |

### Ally Profile

Mounted at `/ally-profile`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload/profile` | Create ally profile with profile photo |
| GET | `/get/profile` | Get authenticated ally profile |
| GET | `/get/public-profile/:publicId` | Get public ally profile |
| PATCH | `/edit/profile` | Update ally profile and optional profile photo |

### Tasks

Mounted at `/tasks`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/upload/task` | Host creates a task with optional attachment |
| GET | `/get/all/tasks` | Get all tasks |
| GET | `/get/all/active/tasks` | Get active posted tasks with optional filters |
| GET | `/get/host/tasks` | Get tasks created by authenticated host |
| GET | `/get/task/:id` | Get one task by id |
| PATCH | `/delete/task/:taskId` | Soft delete a posted task |
| PATCH | `/edit/task/:id` | Edit task fields and optional attachment |

Active task filters can include query params such as `search`, `sort`, `lat`, `lng`, and `distance`.

### Applications

Mounted at `/application/tasks`.

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

Mounted at `/notifications`.

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/get/notifications` | Get recent notifications for the authenticated user |
| PATCH | `/mark/:id/read` | Mark one notification as read |
| PATCH | `/mark/all/read` | Mark all notifications as read |

### AI

AI routes are mounted at:

```text
http://localhost:3000/taskopia/ai/api
```

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/post-task` | Convert a rough task prompt into structured task-posting details |

Example body:

```json
{
  "userPrompt": "I need someone to help move boxes from one apartment to another"
}
```

Expected response shape:

```json
{
  "taskTitle": "Home Shifting Assistance",
  "taskDescription": "Need help moving household items from one home to another.",
  "taskBudget": 1500,
  "category": "Moving & Packing",
  "estimatedTimeHours": 4
}
```

## Cron Jobs

Cron jobs run every 10 minutes from [index.js](index.js).

- [autoCompleteTasks.js](src/cron-jobs/autoCompleteTasks.js): completes tasks that are in `completion_requested` state after their ending date.
- [autoExpiresTasks.js](src/cron-jobs/autoExpiresTasks.js): expires posted tasks after their `postRemovingDate`.

These jobs run inside the API process. For production, consider moving scheduled work into a separate worker process if traffic or reliability needs increase.

## File Uploads

Uploads use Multer with Cloudinary storage:

- Host profile: `userProfilePhotoUrl`, `businessProfilePhotoUrl`
- Ally profile: `userProfilePhotoUrl`
- Task attachment: `attachments`

Cloudinary is configured through `CLOUDINARY_URL`.

## Data Models

Important models live in `src/models`:

- `User`: base authenticated user and role data
- `HostProfile`: host profile, business details, and address
- `AllyProfile`: ally profile, address, rating, and contact details
- `ActiveTask`: posted tasks and task lifecycle status
- `AppliedTask`: applications, status history, and completion state
- `Notification`: ally and host notification records

## Development Notes

- Keep controller logic in `src/controllers`.
- Keep routes thin and focused on URL definitions.
- Reuse `checkAuth` for protected endpoints.
- Store secrets in `.env`, not in source control.
- Use notifications as non-blocking side effects where possible.
- Keep AI calls behind backend routes so API keys never reach the frontend.

## Testing

The current `npm test` script is a placeholder:

```bash
npm test
```

Recommended future tests:

- Auth middleware JWT validation
- Task creation and active-task filtering
- Application accept/reject transaction behavior
- Notification creation helper
- Cron job task-state transitions
- AI route response parsing and error handling

## Useful Files

- [index.js](index.js): server setup and mounted routes
- [db.js](db.js): MongoDB connection
- [src/routes/index.js](src/routes/index.js): main API route registry
- [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js): JWT authentication middleware
- [src/services/ai-services/post-task.js](src/services/ai-services/post-task.js): AI task-posting helper
