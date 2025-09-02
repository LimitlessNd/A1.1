# Chat Application – Git Repository Documentation

## Repository Organization & Usage

The repository contains both a **Node.js server** and **Angular frontend**, with Git used throughout the development process.

### Branching Strategy

- `main` branch: stable production-ready code.  
- Feature branches: used to develop new functionality.  
- Feature branches are merged back into `main` once complete.  
- This allows experimentation without breaking the stable version.

### Update Frequency

- Updates are committed regularly, including:
  - Adding new features  
  - Fixing bugs  
  - Updating documentation or comments  
- Commit messages are clear and descriptive, making development history easy to follow.

### Server and Frontend

- **Frontend (Angular):** Contains UI components for each page of the app.  
- **Backend (Node.js):** Contains routes, session handling, and data management in `server.js`.  

---

## Data Structures

The application uses consistent data structures for **Users, Groups, and Channels**.  
- **Phase 1:** stored in `localStorage`.  
- **Phase 2:** planned migration to MongoDB.

---

## 1. Users

Each user has a unique ID and role determining their permissions.

### Users Table

| Field      | Type     | Description                                                      |
|------------|---------|------------------------------------------------------------------|
| `id`       | string  | Unique identifier for the user (e.g., `u1`, `u2`).               |
| `username` | string  | Unique name chosen by the user.                                   |
| `email`    | string  | Email of the user.                                               |
| `password` | string  | Password (plain text for now; will be hashed in production).     |
| `role`     | string  | User role: `USER`, `GROUP_ADMIN`, or `SUPER_ADMIN`.             |
| `groups`   | string[]| List of group IDs the user belongs to.                           |

### Example Users

| ID  | Username   | Email             | Role        | Groups   |
|-----|-----------|-----------------|------------|---------|
| u1  | super     | super@test.com   | SUPER_ADMIN| g1, g2  |
| u2  | groupAdmin| admin@test.com   | GROUP_ADMIN| g1      |
| u3  | John      | 1@test.com       | USER       | g1      |
| u4  | Mary      | 2@test.com       | USER       | g1, g2  |
| u5  | Steve     | 3@test.com       | USER       | g2      |

---

## 2. Groups

Groups can have multiple admins, many members, and contain channels for chatting.

### Groups Table

| Field         | Type       | Description                                         |
|---------------|-----------|-----------------------------------------------------|
| `id`          | string    | Unique group identifier (e.g., `g1`).             |
| `name`        | string    | Display name of the group.                         |
| `groupAdmins` | string[]  | Array of user IDs who are admins of the group.     |
| `members`     | string[]  | Array of user IDs who are members of the group.    |
| `channels`    | object[]  | Array of channels within the group (see Channels). |

### Example Groups

| ID  | Name          | Admins | Members      | Channels               |
|-----|---------------|--------|-------------|------------------------|
| g1  | Demo Group 1  | u2     | u1, u3, u4  | General, Random        |
| g2  | Demo Group 2  | u5     | u4, u5      | General                |

---

## 3. Channels

Channels are sub-sections inside a group where conversations happen.

### Channels Table

| Field  | Type   | Description                                |
|--------|--------|--------------------------------------------|
| `id`   | string | Unique identifier within a group (e.g., c1). |
| `name` | string | Name of the channel (e.g., General, Random). |

### Example Channels

| ID  | Name          |
|-----|---------------|
| c1  | General       |
| c2  | Random        |
| c3  | Announcements |

# Angular Architecture – Chat Application

## 1️⃣ Components

These handle the UI and user interactions.

| Component                     | Responsibility                                                                 |
|-------------------------------|-------------------------------------------------------------------------------|
| `HomeComponent`               | Landing page, welcomes users, provides link to groups                          |
| `LoginComponent`              | Login form and authentication logic                                           |
| `UserRegistrationComponent`   | User register form, validates input, calls backend to register                   |
| `AccountComponent`            | View/edit account info (username/email), save changes locally and via backend  |
| `GroupComponent`              | List groups, create/delete groups, manage members/admins                      |
| `ChannelComponent`            | View group channels, add/edit/remove channels                                  |
| `AppComponent`                | Root component, loads user info, handles logout and app-wide state             |

---

## 2️⃣ Services

These handle data access and route protection.

### Phase 1

| Service / File      | Responsibility                                                   |
|--------------------|-----------------------------------------------------------------|
| `server.js`        | Node.js backend: handles routes for login, register, users, groups, channels |
| `authGuard`        | Protects frontend routes that require a logged-in user          |

### Phase 2 (Planned Angular Services)

| Service             | Responsibility                                                   |
|--------------------|-----------------------------------------------------------------|
| `AuthService`       | Handles login, logout, session management                        |
| `UserService`       | Fetch users, register new users, update user info                |
| `GroupService`      | Create/delete groups, manage members/admins                      |
| `ChannelService`    | Manage channels inside groups                                     |

---

## 3️⃣ Models

Define the shape of data in the app.

| Model       | Fields / Description                                                                 |
|------------|--------------------------------------------------------------------------------------|
| `User`     | `id`, `username`, `email`, `password`, `role` (`USER`/`GROUP_ADMIN`/`SUPER_ADMIN`), `groups` (array of group IDs) |
| `Group`    | `id`, `name`, `groupAdmins` (array of user IDs), `members` (array of user IDs), `channels` (array of Channel objects) |
| `Channel`  | `id`, `name`                                                                         |

---

## 4️⃣ Routes

Defines navigation and access control.

| Path             | Component                  | Access / Notes                                    |
|-----------------|----------------------------|--------------------------------------------------|
| `/`              | `HomeComponent`           | Public                                           |
| `/login`         | `LoginComponent`          | Public                                           |
| `/register`      | `UserRegistrationComponent`| Public                                           |
| `/account`       | `AccountComponent`        | Protected (logged-in users only, optionally via `authGuard`) |
| `/group`         | `GroupComponent`          | Protected (members/admins; SUPER_ADMIN sees all)|
| `/group/:groupId`| `ChannelComponent`        | Protected (members/admins; can edit channels if admin) |

---

# Node.js Server Architecture – Chat Application

## 1️⃣ Modules

| Module / Package        | Responsibility                                      |
|------------------------|----------------------------------------------------|
| `express`              | Web framework, handles routing and middleware      |
| `cors`                 | Enables Cross-Origin Resource Sharing             |
| `express-session`      | Session management (stores login sessions)        |
| `authGuard`            | Custom middleware to protect routes               |
| `http` / `https`       | (Optional) Used to create server instances        |

---

## 2️⃣ Functions

| Function               | Responsibility                                                                 |
|------------------------|-------------------------------------------------------------------------------|
| `app.post('/api/auth')` | Handles login; verifies email/password, sets session                             |
| `app.get('/api/users')` | Returns all users; protected via `authGuard`                                     |
| `app.post('/api/register')` | Registers a new user; checks for duplicates, adds to user array                  |
| `app.post('/api/logout')`   | Logs out user by destroying session                                               |
| `authGuard(req, res, next)` | Middleware that checks if session exists, allows route access if logged in       |
| `saveGroups()` (in front-end logic) | Saves group data to localStorage (server interaction planned for Phase 2) |

---

## 3️⃣ Files

| File                  | Responsibility                                                    |
|-----------------------|------------------------------------------------------------------|
| `server.js`           | Main server file; initializes Express, middleware, routes, and starts server |
| `authGuard.js`        | Middleware to protect API routes requiring authentication        |
| (Future) `userService.js` | Handles user data management, DB interactions (Phase 2)          |
| (Future) `groupService.js`| Handles group data, members, channels (Phase 2)                 |
| (Future) `channelService.js` | Handles channel data within groups (Phase 2)                  |

---

## 4️⃣ Global Variables

| Variable               | Type           | Purpose                                                         |
|------------------------|---------------|-----------------------------------------------------------------|
| `users`                | Array<User>    | Stores all user objects (hardcoded in Phase 1)                 |
| `groups`               | Object        | Stores group objects (localStorage on front-end; Phase 2 in DB)|
| `app`                  | Express app   | Main Express application instance                               |
| `session`              | Object        | Middleware configuration for storing session data             |
| `req.session.user`     | Object        | Holds currently logged-in user info for a session             |

---

## 5️⃣ Architecture Notes

- Phase 1 uses **hardcoded users** and **localStorage** for group data.
- Phase 2 will move all persistent data to **MongoDB** and use **services** to interact with DB.
- The server handles routing, authentication, and session management, while Angular front-end handles UI and state.

---
# Server-Side Routes – Chat Application

| Route                   | Method | Parameters (Body / Query / Path)                | Return Value / Response                                               | Purpose / Description                                                  |
|-------------------------|--------|-----------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------|
| `/api/auth`             | POST   | Body: `{ email: string, password: string }`    | `{ id, username, email, role, valid: true }` if successful, or `{ valid: false }` | Authenticates a user and sets session data.                             |
| `/api/users`            | GET    | None (protected by `authGuard`)               | Array of users: `[ { id: string, username: string } ]`               | Returns all registered users; only accessible if logged in.            |
| `/api/register`         | POST   | Body: `{ username: string, email: string, password: string }` | `{ message: string, user: { id, username, email } }` on success, or 400 error `{ message: string }` | Registers a new user; checks for existing email/username.              |
| `/api/logout`           | POST   | None                                          | `{ message: 'Logged out successfully' }`                             | Logs out a user by destroying their session.                            |
| (Future) `/api/user`    | PUT    | Body: `{ id, username, email, ... }`          | Updated user object or error                                           | Updates user profile data. (Phase 2: database integration)             |
| (Future) `/api/group`   | POST/PUT/DELETE | Body / Path parameters for group data       | Updated group object or confirmation                                   | Handles creating, updating, and deleting groups.                        |
| (Future) `/api/channel` | POST/PUT/DELETE | Body / Path parameters for channel data     | Updated channel object or confirmation                                 | Handles creating, updating, and deleting channels inside groups.        |

---
# Client-Server Interaction – Chat Application

## Overview
The chat application uses a **Node.js server** with session management and a **standalone Angular frontend**.  
Data is currently stored in **localStorage** (Phase 1) and will later be moved to **MongoDB** (Phase 2).

Each Angular component interacts with the server through HTTP requests. The server processes requests, updates its internal data, and returns the result to the client. The Angular components then update the UI accordingly.

---

## 1. Login Flow

### Client
- Component: `LoginComponent`
- Inputs: Email and Password
- Action: Click **Login**
- HTTP request: `POST /api/auth` with `{ email, password }`

### Server
- Checks if a user exists with the given credentials.
- If valid:
  - Sets `req.session.user` with user info.
  - Returns user data with `{ valid: true }`.
- If invalid: returns `{ valid: false }`.

### Client UI Update
- Stores the user data in `localStorage`.
- Updates `AppComponent` to show logged-in username and role.
- Navigates to `/home` or `/group`.

---

## 2. User Registration

### Client
- Component: `UserRegistrationComponent`
- Inputs: Username, Email, Password
- Action: Click **Register**
- HTTP request: `POST /api/register` with user info.

### Server
- Validates required fields.
- Checks for duplicate username/email.
- Adds new user to the server’s in-memory `users` array.
- Returns a success message with the newly created user.

### Client UI Update
- Displays a **success message** if registration succeeds.
- Navigates user to the **login page**.
- Displays **error messages** if registration fails.

---

## 3. Displaying Users

### Client
- Component: `GroupComponent` (for SUPER_ADMIN)
- Action: Loads the page.
- HTTP request: `GET /api/users` (with session credentials)

### Server
- Protected route via `authGuard`.
- Returns a list of all users: `[ { id, username } ]`.

### Client UI Update
- Populates the `users` array in the component.
- Updates dropdowns and member-selection UI in groups.

---

## 4. Group Management

### Client
- Component: `GroupComponent`
- Actions:
  - **Create Group**
  - **Add/Remove Members**
  - **Promote Admins**
  - **Delete Group**
- Data updates in the component state and then saved in `localStorage` (Phase 1).

### Server (Phase 2)
- Client sends POST/PUT/DELETE requests to `/api/group`.
- Server updates group objects in the database.
- Returns the updated group object or confirmation.

### Client UI Update
- Refreshes `visibleGroups` array.
- Updates group list and selected group panel in the UI.
- Shows alerts/confirmation messages when necessary.

---

## 5. Channel Management

### Client
- Component: `ChannelComponent`
- Actions:
  - **Add/Edit/Remove Channels** within a group
- Updates group object in `localStorage` (Phase 1).

### Server (Phase 2)
- Client sends POST/PUT/DELETE requests to `/api/channel`.
- Server updates channels in the group object in database.
- Returns updated group or channel data.

### Client UI Update
- Refreshes `channels` array in the selected group.
- Updates the channel list in the component dynamically.
- Allows or restricts editing based on user role.

---

## 6. Logout

### Client
- Component: `AppComponent`
- Action: Click **Logout**
- HTTP request: `POST /api/logout`

### Server
- Destroys the user session.
- Returns a success message.

### Client UI Update
- Clears `localStorage` of user info.
- Updates UI to show logged-out state.
- Navigates user to `/login`.

---

## Summary of Angular Data Flow

1. **Components** hold the local state (`users`, `groups`, `channels`, `currentUser`).
2. **HTTP requests** modify server-side data.
3. **Server response** updates the local component state.
4. UI updates **automatically via Angular's data binding**.
5. `localStorage` ensures persistence across page reloads (Phase 1).

