**Taskopia Backend**

Lightweight backend for Taskopia — a task/marketplace platform connecting Hosts and Allies.

**Quick Start**
- **Prerequisites:** `Node.js` (14+), `npm` or `yarn`, a MongoDB instance, and a Firebase service account for notifications.
- **Install:**

```
npm install
```

- **Run (development):**

```
npm run dev
```

- **Entry point:** See [index.js](index.js).

**Project Structure (key folders)**
- **`src/controllers/`**: route handlers and business logic (e.g. [user.auth.controller.js](src/controllers/user.auth.controller.js)).
- **`src/models/`**: Mongoose models like `User`, `Notification`, host/ally models.
- **`src/routes/`**: Express route definitions (e.g. `user.routes.js`, `task.routes.js`).
- **`src/utils/`**: helpers and integrations: `cloudinary.js`, `firebaseAdmin.js`, `jwtToken.js`, `sendMail.js`.
- **`src/middlewares/`**: middleware such as `auth.middleware.js`.
- **`src/cron-jobs/`**: scheduled tasks (`autoCompleteTasks.js`, `autoExpiresTasks.js`).
- **`https/`**: HTTP request examples (`getUser.http`).

**Routes / Functionality Overview**
- User auth and profiles: registration, login, JWT handling (`src/controllers/user.auth.controller.js`).
- Host features: post tasks, host profile controllers (`src/HostControllers/`).
- Ally features: apply tasks, ally profiles (`src/AllyControllers/`).
- Notifications: creation and delivery (`src/controllers/NotificationsControllers/notificationController.js`).
- Mail: transactional emails (`src/controllers/MailControllers/mail.controllers.js`).

**Configuration & Environment**
- Place sensitive credentials in environment variables or protected files (not checked into VCS).
- Typical variables used by this project:
  - `PORT` — server port
  - `MONGO_URI` — MongoDB connection string
  - `JWT_SECRET` — JWT signing secret
  - Cloudinary keys (if using media upload): `CLOUDINARY_*`
  - Email SMTP credentials for `sendMail.js`
  - Firebase service account: `serviceAccount.json` (project root contains `serviceAccount.json`)

**Notable Files**
- Server start: [index.js](index.js)
- Authentication middleware: [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js)
- Example route definitions: [src/routes/index.js](src/routes/index.js)

**Development Notes**
- Cron jobs live in `src/cron-jobs/` and are intended to be started with the app process or a separate worker.
- Cloudinary and Firebase helpers are in `src/utils/` and should be configured via env variables or `serviceAccount.json`.

**Testing**
- No tests are included in the repo by default. Add tests with your preferred framework (Jest, Mocha).

**Contributing**
- Fork, create a feature branch, add tests, and open a pull request describing your changes.

**License**
- MIT (or update to the appropriate license).

---

If you want, I can:
- add example `.env.example` with required variables,
- extract and list all env keys from code,
- or run `npm run dev` to verify startup (you'll need to provide runtime secrets).
