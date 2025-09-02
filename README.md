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

Groups can have multiple admins, many members, and contain channels for chatting (many to many relationship).

### Groups Table

| Field         | Type       | Description                                         |
|---------------|-----------|-----------------------------------------------------|
| `id`          | string    | Unique group identifier (e.g., `g1`).             |
| `name`        | string    | Display name of the group.                         |
| `groupAdmins` | string[]  | Array of user IDs who are admins of the group.     |
| `members`     | string[]  | Array of user IDs who are members of the group.    |
| `channels`    | object[]  | Array of channels within the group. |

### Example Groups

| ID  | Name          | Admins | Members      | Channels               |
|-----|---------------|--------|-------------|------------------------|
| g1  | Demo Group 1  | u2     | u1, u3, u4  | General, Random        |
| g2  | Demo Group 2  | u5     | u4, u5      | General                |

---

## 3. Channels

Channels are sub-sections inside a group where conversations will eventually happen.

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
| `UserRegistrationComponent`   | User register form which validates input and calls backend to register                   |
| `AccountComponent`            | View/edit account info (username/email), save changes locally and via backend  |
| `GroupComponent`              | List, create, delete groups, manage members and admins                      |
| `ChannelComponent`            | View group channels, add, edit and remove channels                                  |
| `AppComponent`                | Root component, loads user info and handles logout           |

---

## 2️⃣ Services

These handle data access and route protection.

### Phase 1

| Service / File      | Responsibility                                                   |
|--------------------|-----------------------------------------------------------------|
| `server.js`        | Node.js backend: handles routes for login, register and users |
| `authGuard`        | Protects frontend routes that require a logged-in user with AuthGuard          |

### Phase 2 (Planned Angular Services)

| Service             | Responsibility                                                   |
|--------------------|-----------------------------------------------------------------|
| `AuthService`       | Handles login, logout and session management                        |
| `UserService`       | Fetch users, register new users and ability to update the user info                |
| `GroupService`      | Create and delete groups, manage members/admins                      |
| `ChannelService`    | Manage channels inside each group                                     |

---

## 3️⃣ Models

Defining the shape of data within the app.

| Model       | Fields / Description                                                                 |
|------------|--------------------------------------------------------------------------------------|
| `User`     | `id`, `username`, `email`, `password`, `role` (`USER`/`GROUP_ADMIN`/`SUPER_ADMIN`), `groups` (array of group IDs) |
| `Group`    | `id`, `name`, `groupAdmins` (array of user IDs), `members` (array of user IDs), `channels` (array of Channel objects) |
| `Channel`  | `id`, `name`                                                                         |

---

## 4️⃣ Routes

Defines navigation and access control within the app.

| Path             | Component                  | Access / Notes                                    |
|-----------------|----------------------------|--------------------------------------------------|
| `/`              | `HomeComponent`           | Public                                           |
| `/login`         | `LoginComponent`          | Public                                           |
| `/register`      | `UserRegistrationComponent`| Public                                           |
| `/account`       | `AccountComponent`        | Protected (logged-in users only, optionally via `authGuard`) |
| `/group`         | `GroupComponent`          | Protected (members/admins; SUPER_ADMIN sees all)|
| `/group/:groupId`| `ChannelComponent`        | Protected (members/admins; can edit channels only if admin) |

---

# Node.js Server Architecture – Chat Application

## 1️⃣ Modules

| Module / Package        | Responsibility                                      |
|------------------------|----------------------------------------------------|
| `express`              | Web framework that handles routing and middleware      |
| `cors`                 | Enables Cross-Origin Resource Sharing             |
| `express-session`      | Session management that will store login sessions        |
| `authGuard`            | Common middleware to protect routes               |
| `http` / `https`       | Used to create server instances        |

---

## 2️⃣ Functions

| Function               | Responsibility                                                                 |
|------------------------|-------------------------------------------------------------------------------|
| `app.post('/api/auth')` | Handles login; verifies email/password, sets session                             |
| `app.get('/api/users')` | Returns all users; protected via `authGuard`                                     |
| `app.post('/api/register')` | Registers a new user; checks for duplicates, adds to user array                  |
| `app.post('/api/logout')`   | Logs out user by destroying session                                               |
| `authGuard(req, res, next)` | Middleware that checks if session exists and allows route access if logged in       |
| `saveGroups()` (front-end logic) | Saves group data to localStorage (server interaction planned for Phase 2) |

---
## 3️⃣ Common Functions

| Function                     | Responsibility                                                                 |
|-------------------------------|-------------------------------------------------------------------------------|
| `updateVisibleGroups()`       | Updates the list of groups visible to the current user based on role |
| `canEdit(group)`              | Checks if the current user can edit a group   |
| `createGroup()`               | Creates a new group and saves it to localStorage                                |
| `removeGroup(groupId)`        | Deletes a group if the user has permission (GroupAdmin or SA)                                       |
| `leaveGroup(groupId)`         | Removes the user from that specific group                                 |
| `addMember()`                 | Adds a new member to a group (GroupAdmin or SuperAdmin)                                       |
| `removeMember()`              | Removes a member from a group (GroupAdmin or SuperAdmin)                             |
| `makeGroupAdmin()`            | Promotes a member to group admin (only SUPER_ADMIN)                             |
| `getUsernameById(id)`         | Returns the username corresponding to the given user ID                            |
| `saveGroups()`                | Saves the `groups` object to localStorage                                       |

---

## 4️⃣ Files

| File                  | Responsibility                                                    |
|-----------------------|------------------------------------------------------------------|
| `server.js`           | Main server file; initializes Express, middleware, routes, and starts the node server |
| `authGuard.js`        | Middleware to protect API routes that require a form of authentication        |
| (Future) `userService.js` | Handles user data management, DB interactions (Phase 2)          |
| (Future) `groupService.js`| Handles group data, members and channels (Phase 2)                 |
| (Future) `channelService.js` | Handles channel data within groups (Phase 2)                  |

---

## 5️⃣ Global Variables

| Variable               | Type           | Purpose                                                         |
|------------------------|---------------|-----------------------------------------------------------------|
| `users`                | Array<User>    | Stores all user objects (hardcoded in Phase 1)                 |
| `groups`               | Object        | Stores group objects (localStorage on front-end; Phase 2 in DB)|
| `app`                  | Express app   | Main Express application instance                               |
| `session`              | Object        | Middleware for storing session data             |
| `req.session.user`     | Object        | Holds the currently logged-in user info for the session             |

---

## 6️⃣ Architecture Notes

- Phase 1 uses **hardcoded users** and **localStorage** for group data.
- Phase 2 will move all persistent data to **MongoDB** and use **services** to interact with MongoDB.
- The server handles routing, authentication, session management, whilst Angular front-end handles the UI and state.

---
# Server-Side Routes – Chat Application

| Route                   | Method | Parameters (Body / Query / Path)                | Return Value / Response                                               | Purpose / Description                                                  |
|-------------------------|--------|-----------------------------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------|
| `/api/auth`             | POST   | Body: `{ email: string, password: string }`    | `{ id, username, email, role, valid: true }` if successful, or `{ valid: false }` | Authenticates a user.                             |
| `/api/users`            | GET    | None (protected by `authGuard`)               | Array of users: `[ { id: string, username: string } ]`               | Returns all registered users; only accessible if logged in.            |
| `/api/register`         | POST   | Body: `{ username: string, email: string, password: string }` | `{ message: string, user: { id, username, email } }` on success, or 400 error `{ message: string }` | Registers a new user; checks for an existing username or password and throws an error if so.
| `/api/logout`           | POST   | None                                          | `{ message: 'Logged out successfully' }`                             | Logs out a user by stopping their session.                            |
| (Future) `/api/user`    | PUT    | Body: `{ id, username, email, ... }`          | Updated user object or error                                           | Updates user profile data. (Phase 2: database integration)             |
| (Future) `/api/group`   | POST/PUT/DELETE | Body / Path parameters for group data       | Updated group object or confirmation                                   | Handles creating, updating, and deleting each group.                        |
| (Future) `/api/channel` | POST/PUT/DELETE | Body / Path parameters for channel data     | Updated channel object or confirmation                                 | Supports creating, updating, and deleting channels inside each group.        |

---
# Client-Server Interaction – Chat Application

## Overview
The chat application uses a **Node.js server** with session management and a **standalone Angular frontend**.  
Data is currently stored in **localStorage** (Phase 1) and will later be moved to **MongoDB** (Phase 2).

All Angular components interact with the server through HTTP requests for phase 1. The server processes the requests and updates its stored data and then returns the result to the user. The Angular components will then update the UI.

---

## 1. Login Flow

### Client
- Component: `LoginComponent`
- Inputs: Email and Password
- Action: Click **Login**
- HTTP request: `POST /api/auth` with `{ email, password }`

### Server
- Checks if a user exists with through a search of the stored data.
- If valid:
  - Sets `req.session.user` with user info.
  - Returns user data with `{ valid: true }`.
- If invalid: returns `{ valid: false }` and will throw an error.

### Client UI Update
- Stores the user data in `localStorage`.
- Updates `AppComponent` to show logged-in username and role in top right hand corner.
- Navigates to the `/home` page.

---

## 2. User Registration

### Client
- Component: `UserRegistrationComponent`
- Inputs: Username, Email, Password
- Action: Click **Register**
- HTTP request: `POST /api/register` with user info.

### Server
- The server then validates required fields.
- Checks for duplicate username/email, if there is an error in any field there will be an error that is shown onscreen. 
- Adds new user to the server’s memory `users` array.
- Returns a success message which can then be used to log into their new account.

### Client UI Update
- Displays a **success message** if registration succeeds.
- Will show a login button when account has been created which takes them to the **login page**.
- If any error in creation an **error messages**  will displays.

---

## 3. Displaying Users

### Client
- Component: `GroupComponent` (for SUPER_ADMIN)
- Action: Loads the page.
- HTTP request: `GET /api/users`
- This is used to remove users from the site which will wipe them from the memory.  

### Server
- Protected route via `authGuard`.
- Returns a list of all users: `[ { id, username } ]`.
- Only for the superAdmin to see.

### Client UI Update
- Populates the `users` array in the component.
- Updates dropdowns and member-selection UI in groups.
- This is for editing the groups, members, promotion as a group admin or being removed from the group. 

---

## 4. Group Management

### Client
- Component: `GroupComponent`
- Actions:
  - **Create Group**
  - **Add/Remove Members**
  - **Promote Admins**
  - **Delete Group**
- The Data is updated in the component state and saved in `localStorage` for (Phase 1).

### Server (Phase 2)
- Client sends POST/PUT/DELETE requests to the newly created `/api/group`.
- Server updates group objects in the database through mongoDB.
- Returns the updated group object.

### Client UI Update
- Refreshes `visibleGroups` array.
- Updates groups and the selected group panel.

---

## 5. Channel Management

### Client
- Component: `ChannelComponent`
- Actions:
  - **Add/Edit/Remove Channels** within a group.
- Updates group object in `localStorage` (Phase 1).

### Server (Phase 2)
- Client sends POST/PUT/DELETE requests to `/api/channel` (same way as the groups).
- Server updates channels in the group object within the database.
- Returns updated group and the new channel data.

### Client UI Update
- Refreshes `channels` array in the selected group.
- Updates the channel list in the component.
- It will only allow group admins and the SuperAdmin to edit.

---

## 6. Logout

### Client
- Component: `AppComponent`
- Action: Click **Logout**
- HTTP request: `POST /api/logout`

### Server
- Stops the user session.

### Client UI Update
- Clears all `localStorage` of user info.
- Updates the UI which shows a new logged-out state.
- Navigates user to an empty `/login` page.

---

## Summary of Angular Data Flow

1. **Components** hold the local state (`users`, `groups`, `channels`, `currentUser`).
2. **HTTP requests** modify most server-side data.
3. **Server response** updates the local component state.
4. UI updates
5. Implementation of `localStorage` ensures persistence across page reloads (Phase 1).

