# The Organisation of the Git Repository

*(Image of what the structure looks like.)*

## How I used Git as part of my development solution

The Git repository was used to save all working parts of the assignment during all stages. Implementing MongoDB and removing local storage took some time to figure out, which is why the Git history is concentrated towards the end of the development period.  

### The key phases during development

- **Small commits** that reflected changes to add specific criteria and fixing small bugs in the back and frontend.  
- **Branching** was used to perform end to end testing, however this was not fully achieved it allowed me to experiment safely without compromising any previous data.  
- The **main branch** was stable throughout the assignment and only contain working code that would run without any errors.  

---

## Data Structures Used in the Client and Server

The application had 4 main data entities: Users, groups, channels, and messages. Each of these data structures were represented on both the clients and server side.  

### 1. Users

The users are stored in a user’s collection in the mongoDb server-side.

```json
{
  "_id": ObjectId,
  "username": "string",
  "email": "string",
  "password": "string", 
  "roles": ["USER"],
  "groups": [ObjectId]  // References to groups the user belongs to
}
```

   **Client-side –** within the client side the users are fetched to maintain currentlu logged in users and their role which will determine their access to certain features.

```json
   {
   `  `username: string,

   `  `email: string,

   `  `roles: string[],

   `  `groups: string[]  // IDs of groups the user belongs to

   }
```
### 2. Groups  

**Server-side**

```json
{
  "_id": "68e4a0f25aa42fe445da9e8d",
  "name": "Project Team",
  "groupAdmins": ["SuperAdmin"],
  "members": ["SuperAdmin", "Joel27"],
  "channels": ["General", "Project"]
}
```

- **Id** - Unique ID for the group  
- **Name** – Name of the group  
- **groupAdmins** - Array of users that have privileges  
- **members** - Array of users  
- **channels** - Array of channels that are linked to the group  

---

### 3. Channels

**Server side**  
The channels are embedded objects within the groups to represent they belong to the group.

```json
"Channels": [
   {

   "\_id": "68e4b00c25d9639046467f03",

   "name": "General",

   "description": "General discussion"

   }

   ]
   ```
- **Id** - Unique ID for the channel  
- **name** - groups name  
- **description** - description of the channel  

---

### 4. Messages

**Server Side**
```json
   {

   `  `"\_id": "68df5cae6682b8d7afba5e6b",

   `  `"channelId": "c1",

   `  `"username": "superAdmin",

   `  `"message": "hey",

   `  `"createdAt": "2025-10-03T05:18:38.899Z"

   }
   ```

 - **Id** - Unique Id  
- **channelId** - ID of the channel it belongs to  
- **username** - Who sent the message  
- **message** - Text within the message  
- **createdAt** - Timestamp  

---

## **Division of Responsibilities Between Client and Server**

### **The Server-side Responsibilities**

#### 1. Managing and Storing the Data
- Users, groups, channels and messages are stored in the MongoDB database.  
- It handles the creation, reading, updating and deleting (CRUD) for the entities.  
- Groups store vital data, user Id’s, Group admins Id’s and channel Id’s.  
- The channels are linked within each group and contain messages.  
- It references a channel ID and the username of who it was sent by.  

#### 2. Authorization and Authentication
- Uses token-based authentication to track the logged in users.  
- AuthGuard is the middleware that protects the routes to ensure only logged in users can use the features.  
- Roles determine access to certain features. (User, GroupAdmin and SuperAdmin). The superAdmin can see all groups and manage any group.  
- The GroupAdmin has access to their own groups and they can remove, add, edit members or groups.  
- The server handles login and logout using (/api/auth) and (/api/logout).  

#### 3. REST API
- The endpoints that the client uses.  
- `/api/groups` - This fetches, creates, updates, manages and deletes groups.  
- `/api/channels` - This fetches the channels for a group, deletes and adds channels.  
- `/api/users` - To fetch users to add them to groups or channels.  
- This returns a JSON response for the client to easily render the data.  
- The server will then validate the request and check permissions.  

---

## **Client-side Responsibilities**

#### 1. User Interface
- There are dynamic pages for channels, groups and messages.  
- The navbar shows the currently logged in user and their role within the application.  
- Handles creating groups, navigating between pages and adding and removing members.  

#### 2. HTTP Communication
- It uses the HttpClient to make HTTP requests to get to the server endpoints.  
- Handles sending the credentials with the requests.  
- Handles all server responses and UI accordingly.  

#### 3. Routing
- Using the Angular Router to navigate between different components.  
- `/groups` – list groups that the user is in.  
- `/groups/:id/channels` – To view the channels that are associated with the user.  

#### 4. Client-Side Validation
- Checks for empty input values or duplicate members before sending the request.  

---

## **The Interaction Between Both the Client and Server**

1. The Angular client sends a HTTP request to the server’s API.  
2. The server then will process the request which then will check the authentication and authorization. Reads or will modify the data in MongoDB.  
3. It will then return the JSON data, or it will lead to an error.  
4. **Examples for creating a group:**  
   - The client will send a `POST /api/groups` with the group name and description.  
   - The server will then insert the group into MongoDB with the 2 default channels and Admin.  
   - The server then will create a new groupID.  
   - The client then fetches the group and refreshes the UI.


Groups API (/api/groups)

|Route|Method|Parameters|Return Value|Purpose|
| :- | :- | :- | :- | :- |
|/|GET|None|JSON array of groups|Fetches all groups, dependent on their role.|
|/:id|GET|id|JSON object of the group|Gets a single group by the id.|
|/|POST|Body: name, GroupAdmins, members and channels|{ message, \_id }|Creates a new group, default the admin and channels.|
|/:id|PUT|id|{ message }|Updates the group details.|
|/:id|DELETE|id|{ message }|Admin or super, deletes the group.|
|/:id/leave|PUT|id|{ message }|Leave group, only user can leave.|
|/:id/add-member|PUT|id, Body: { userId }|{ message }|Add member to group.|
|/:id/remove-member|PUT|id, Body: { userId }|{ message }|Remove member from group.|
|/:id/add-admin|PUT|id, Body: { userId }|{ message }|Promote to group admin.|
|/:groupId/add-channel|PUT|groupId, Body: { name, description }|JSON group updated|Add new channel to group.|

Channels API (/api/channels)

|Route |Method|Parameters|Return Value|Purpose|
| :- | :- | :- | :- | :- |
|/:groupId|GET|groupId|Array of channels|Get all channels from group.|
|/:channelId|DELETE|channelId|{message}|Delete a channel from the group.|

## Auth & Session API (/api)

| Route | Method | Parameters | Return Value | Purpose |
| :- | :- | :- | :- | :- |
| /auth | POST | { email, password } | { valid, _id, username, roles, email } | Log in user and start the session. |
| /user/current | GET | None | Currently logged in user in JSON format | Get the current user’s info from session. |
| /logout | POST | None | { message } | Log out and destroy session. |
| /register | POST | { username, email, password } | { success, _id, username, email } | Register a new user. |

## Angular Components

| Component | Purpose | Feature |
| :- | :- | :- |
| Home Component | The user is taken to the home page that shows dashboard with links to the groups and channels. | Uses the HttpClient to fetch the user’s information. |
| Login Component | Handles the login from the client side. | Submits the credentials to /api/auth. When successful they are logged into the session. |
| User-registration Component | Handles all the new user registration. | Submits the form to /api/register that creates the user and stores the data to the database. |
| Group Component | Manages the groups, where you can use CRUD to manage the members and admins. | Calls the /api/groups and /api/users to handle navigation. |
| Channel Component | Shows the channels within the selected group, allows adding and removing the channels. | Calls /api/channels/:groupId to update the UI after the changes in the channels. |
| ChannelView Component | Handles the chatting in real time for the specific channel. | Connected through Socket.io to send and receive messages in real time. |

---

## Backend Services 

| Service | Purpose | Notes |
| :- | :- | :- |
| Channel Service | Manages the channels within the groups. | CRUD operations for the channels that are stored within the groups. |
| Group Service | Manages the groups and permissions. | Handles the members, admin roles and the permissions. |
| Message Service | Stores and receives all chat messages. | Messages are stored in “messages”, and they are used by sockets. |
| User Service | Manages the Users. | Manages the registration and authentication. |

- All the services use the `getDb()` as they have access to the MongoDB.  
- `ObjectId` is used for the document identification.

---

## Angular Frontend Service

| Service | Purpose | Notes |
| :- | :- | :- |
| Chat Service | Handles the real time messages using sockets. | Uses a socket.io client to communicate and grabs stored messages. |

## Login and User-Registration

- **Components**- LoginComponent, UserRegistrationComponent  
- **Services**- UserService, calls /api/user or /api/auth  
- User submits a login form and the UserService sends a POST request with credentials.  
- Display update- On success, taken to the home component which displays their username and role. On failure, shows an error message.  
- req.session.user is set with logged-in user info.  

---

1. Groups/ Channels

**Client Side-** HomeComponent calls GroupService to fetch groups (GET /api/groups). GroupComponent calls ChannelService for channels (GET /api/channels/:groupId).  

**Server Side-** routes/groups.js or routes/channels.js uses global getDb() to access MongoDB. The results are returned as a JSON.  

---

2. CRUD for Groups and Channels

User will interact with the forms and buttons in the Group Component and Channel Component. Data is sent via service to the server routes.  

Routes/groups.js or routes/channels.js calls the service functions and the MongoDB is updated.  

---

3. Sockets

ChannelView Component initializes Chat Service, which connects to the server socket. joinChannel(channelId) sends a socket event which then calls sendMessage(channelId, message) transmits new messages. Socket.io will listen for joinChannel and send message, the messages are inserted into the messages collection in the DB.  