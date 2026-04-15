# Dood Backend API

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dood-db
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

3. Make sure MongoDB is running on your machine.

4. Start the server:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

### Authentication

#### 1. Signup (POST)

**URL:** `/api/auth/signup`

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "password123",
  "phoneNumber": "9999999999",
  "dob": "1990-01-15"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phoneNumber": "9999999999",
    "dob": "1990-01-15"
  }
}
```

#### 2. Login (POST)

**URL:** `/api/auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phoneNumber": "9999999999",
    "dob": "1990-01-15"
  }
}
```

#### 3. Forgot Password (POST)

**URL:** `/api/auth/forgot-password`

**Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

#### 4. Reset Password (PUT)

**URL:** `/api/auth/reset-password/:resetToken`

**Body:**

```json
{
  "password": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successful",
  "token": "jwt_token_here"
}
```

#### 5. Get Current User (GET)

**URL:** `/api/auth/me`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phoneNumber": "9999999999",
    "dob": "1990-01-15",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 6. Verify OTP and Reset Password (POST)

**URL:** `/api/auth/verify-otp-and-reset`

**Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password reset successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe"
  }
}
```

#### 7. Get User with Token (POST)

**URL:** `/api/auth/me-with-token`

**Body:**

```json
{
  "token": "jwt_token_here"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "phoneNumber": "9999999999",
    "dob": "1990-01-15"
  }
}
```

### Dreams

#### 1. Create Dream (POST)

**URL:** `/api/dreams`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Body:**

```json
{
  "title": "Learn Web Development",
  "subTitle": "Master MERN Stack",
  "description": "Complete a full MERN stack course and build projects",
  "type": "work",
  "priority": "high",
  "status": "in progress",
  "image": "https://example.com/image.jpg",
  "targetDate": "2024-12-31",
  "notes": "Focus on React and Node.js"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Dream created successfully",
  "dream": {
    "_id": "dream_id",
    "userId": "user_id",
    "title": "Learn Web Development",
    "subTitle": "Master MERN Stack",
    "description": "Complete a full MERN stack course and build projects",
    "type": "work",
    "priority": "high",
    "status": "in progress",
    "image": "https://example.com/image.jpg",
    "targetDate": "2024-12-31",
    "progress": 0,
    "notes": "Focus on React and Node.js",
    "timeline": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Get All Dreams (GET)

**URL:** `/api/dreams`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Query Parameters (optional):**
- `type` - Filter by type (work, achievement, relation, finance, home)
- `status` - Filter by status (in progress, slow down, boosted)
- `priority` - Filter by priority (low, medium, high, top)
- `sortBy` - Sort by (priority, timeline, targetDate, progress, default: createdAt)

Example: `/api/dreams?type=work&status=in progress&sortBy=priority`

**Response:**

```json
{
  "success": true,
  "count": 5,
  "dreams": [
    {
      "_id": "dream_id",
      "userId": "user_id",
      "title": "Learn Web Development",
      "subTitle": "Master MERN Stack",
      "type": "work",
      "priority": "high",
      "status": "in progress",
      "progress": 45,
      "timeline": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 3. Get Single Dream (GET)

**URL:** `/api/dreams/:id`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "dream": {
    "_id": "dream_id",
    "userId": "user_id",
    "title": "Learn Web Development",
    "subTitle": "Master MERN Stack",
    "description": "Complete a full MERN stack course and build projects",
    "type": "work",
    "priority": "high",
    "status": "in progress",
    "progress": 45,
    "targetDate": "2024-12-31",
    "notes": "Focus on React and Node.js",
    "timeline": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. Update Dream (PUT)

**URL:** `/api/dreams/:id`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Body:** (All fields are optional)

```json
{
  "title": "Updated Title",
  "status": "boosted",
  "progress": 70,
  "priority": "top"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Dream updated successfully",
  "dream": {
    "_id": "dream_id",
    "userId": "user_id",
    "title": "Updated Title",
    "status": "boosted",
    "progress": 70,
    "priority": "top"
  }
}
```

**Note:** Only one dream can have priority "top" per user. If you set another dream to "top", the previous "top" dream will automatically be downgraded to "high".

#### 5. Update Dream Progress (PATCH)

**URL:** `/api/dreams/:id/progress`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Body:**

```json
{
  "progress": 75
}
```

**Response:**

```json
{
  "success": true,
  "message": "Dream progress updated",
  "dream": {
    "_id": "dream_id",
    "progress": 75
  }
}
```

#### 6. Delete Dream (DELETE)

**URL:** `/api/dreams/:id`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "message": "Dream deleted successfully",
  "dreamId": "dream_id"
}
```

#### 7. Get Dream Statistics (GET)

**URL:** `/api/dreams/stats/summary`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalDreams": 5,
    "averageProgress": 52,
    "byType": {
      "work": 2,
      "achievement": 1,
      "finance": 1,
      "relation": 1
    },
    "byStatus": {
      "in progress": 3,
      "boosted": 1,
      "slow down": 1
    },
    "byPriority": {
      "high": 2,
      "medium": 2,
      "low": 1,
      "top": 0
    }
  }
}
```

### Actions

#### 1. Create Action (POST)

**URL:** `/api/actions`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Body:**

```json
{
  "title": "Learn React Basics",
  "description": "Complete first 5 chapters of React course",
  "priority": "high",
  "status": "in progress",
  "dueDate": "2024-04-15",
  "dreamId": "dreamIdHere",
  "notes": "Focus on hooks and state management"
}
```

**Note:** `dreamId` is optional. Actions can be created standalone or linked to a specific dream.

**Response:**

```json
{
  "success": true,
  "message": "Action created successfully",
  "action": {
    "_id": "action_id",
    "userId": "user_id",
    "title": "Learn React Basics",
    "priority": "high",
    "status": "in progress",
    "dueDate": "2024-04-15",
    "dreamId": {
      "_id": "dream_id",
      "title": "Learn Web Development"
    }
  }
}
```

#### 2. Get All Actions (GET)

**URL:** `/api/actions`

**Query Parameters (optional):**
- `status` - Filter: not started, in progress, completed
- `priority` - Filter: low, medium, high
- `dreamId` - Get actions for specific dream
- `sortBy` - Sort by: priority, dueDate, status, createdAt

**Response:**

```json
{
  "success": true,
  "count": 5,
  "actions": [...]
}
```

#### 3. Get Actions for Specific Dream (GET)

**URL:** `/api/actions/dream/:dreamId`

**Response:**

```json
{
  "success": true,
  "count": 3,
  "dreamTitle": "Learn Web Development",
  "actions": [...]
}
```

#### 4. Get Single Action (GET)

**URL:** `/api/actions/:id`

**Response:**

```json
{
  "success": true,
  "action": {...}
}
```

#### 5. Update Action (PUT)

**URL:** `/api/actions/:id`

**Body:** (All fields optional)

```json
{
  "title": "Updated Title",
  "status": "in progress",
  "priority": "medium",
  "dreamId": "newDreamId"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Action updated successfully",
  "action": {...}
}
```

#### 6. Mark Action as Completed (PUT)

**URL:** `/api/actions/:id/complete`

**Response:**

```json
{
  "success": true,
  "message": "Action marked as completed",
  "action": {
    "status": "completed",
    "completedDate": "2024-03-26T10:30:00.000Z"
  }
}
```

#### 7. Delete Action (DELETE)

**URL:** `/api/actions/:id`

**Response:**

```json
{
  "success": true,
  "message": "Action deleted successfully",
  "actionId": "action_id"
}
```

#### 8. Get Action Statistics (GET)

**URL:** `/api/actions/stats/summary`

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalActions": 10,
    "completedToday": 2,
    "dueSoon": 3,
    "connectedToDream": 6,
    "standAlone": 4,
    "byStatus": {
      "not started": 2,
      "in progress": 5,
      "completed": 3
    },
    "byPriority": {
      "low": 1,
      "medium": 4,
      "high": 5
    }
  }
}
```

## Tasks API

Tasks are small actionable items that can exist at multiple hierarchy levels:
- **Standalone**: Independent tasks not linked to any action or dream
- **Action-linked**: Tasks linked to a specific action
- **Dream-linked**: Tasks linked directly to a dream (without going through an action)

Tasks include time tracking capabilities and completion toggle functionality.

#### 1. Create Task - Standalone (POST)

**URL:** `/api/tasks`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Body:**

```json
{
  "title": "Buy groceries",
  "description": "Buy milk, eggs, bread",
  "priority": "medium",
  "dueDate": "2024-03-28",
  "estimatedTime": 30,
  "notes": "From local market"
}
```

**Note:** `actionId` and `dreamId` are both optional. Omit both to create standalone task.

**Response:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "task_id",
    "userId": "user_id",
    "title": "Buy groceries",
    "description": "Buy milk, eggs, bread",
    "priority": "medium",
    "dueDate": "2024-03-28",
    "isCompleted": false,
    "timeSpent": 0,
    "estimatedTime": 30,
    "actionId": null,
    "dreamId": null,
    "createdAt": "2024-03-26T10:00:00.000Z"
  }
}
```

#### 2. Create Task - For Action (POST)

**URL:** `/api/tasks`

**Body:**

```json
{
  "title": "Write introduction",
  "description": "Write 500 word introduction",
  "priority": "high",
  "actionId": "actionIdHere",
  "dueDate": "2024-03-27",
  "estimatedTime": 60
}
```

**Note:** If action is linked to a dream, the `dreamId` will be auto-inherited from the action.

**Response:**

```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "task_id",
    "userId": "user_id",
    "title": "Write introduction",
    "actionId": "action_id",
    "dreamId": "dream_id",
    "priority": "high",
    "isCompleted": false,
    "timeSpent": 0,
    "estimatedTime": 60
  }
}
```

#### 3. Create Task - For Dream (POST)

**URL:** `/api/tasks`

**Body:**

```json
{
  "title": "Setup development environment",
  "description": "Install Node.js and dependencies",
  "priority": "high",
  "dreamId": "dreamIdHere",
  "dueDate": "2024-03-27",
  "estimatedTime": 45
}
```

**Note:** This creates a task linked directly to dream without an action intermediary.

#### 4. Get All Tasks (GET)

**URL:** `/api/tasks`

**Query Parameters (optional):**
- `isCompleted` - Filter: true or false
- `priority` - Filter: low, medium, high
- `actionId` - Get tasks for specific action
- `dreamId` - Get tasks for specific dream
- `sortBy` - Sort by: priority, dueDate, createdAt, estimatedTime

**Response:**

```json
{
  "success": true,
  "count": 15,
  "tasks": [...]
}
```

#### 5. Get Single Task (GET)

**URL:** `/api/tasks/:id`

**Response:**

```json
{
  "success": true,
  "task": {
    "_id": "task_id",
    "userId": "user_id",
    "title": "Buy groceries",
    "priority": "medium",
    "isCompleted": false,
    "timeSpent": 0,
    "estimatedTime": 30,
    "dueDate": "2024-03-28",
    "actionId": null,
    "dreamId": null,
    "createdAt": "2024-03-26T10:00:00.000Z"
  }
}
```

#### 6. Get Tasks for Specific Action (GET)

**URL:** `/api/tasks/action/:actionId`

**Response:**

```json
{
  "success": true,
  "count": 5,
  "actionTitle": "Learn React Basics",
  "tasks": [...]
}
```

#### 7. Get Tasks for Specific Dream (GET)

**URL:** `/api/tasks/dream/:dreamId`

**Response:**

```json
{
  "success": true,
  "count": 12,
  "dreamTitle": "Learn Web Development",
  "tasks": [...]
}
```

#### 8. Update Task (PUT)

**URL:** `/api/tasks/:id`

**Body:** (All fields optional)

```json
{
  "title": "Updated Title",
  "priority": "high",
  "estimatedTime": 90,
  "dueDate": "2024-03-30",
  "notes": "Updated notes"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "task": {...}
}
```

#### 9. Toggle Task Completion (PUT)

**URL:** `/api/tasks/:id/toggle`

**Note:** This endpoint toggles the `isCompleted` flag. When marking as complete, `completedDate` is auto-set.

**Response:**

```json
{
  "success": true,
  "message": "Task completion toggled",
  "task": {
    "_id": "task_id",
    "isCompleted": true,
    "completedDate": "2024-03-26T10:30:00.000Z"
  }
}
```

#### 10. Add Time Spent (PUT)

**URL:** `/api/tasks/:id/add-time`

**Body:**

```json
{
  "minutes": 30
}
```

**Note:** Time is accumulated. Each call adds to the existing `timeSpent`.

**Response:**

```json
{
  "success": true,
  "message": "Time added successfully",
  "task": {
    "_id": "task_id",
    "timeSpent": 30,
    "estimatedTime": 60
  }
}
```

#### 11. Delete Task (DELETE)

**URL:** `/api/tasks/:id`

**Response:**

```json
{
  "success": true,
  "message": "Task deleted successfully",
  "taskId": "task_id"
}
```

#### 12. Get Task Statistics (GET)

**URL:** `/api/tasks/stats/summary`

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalTasks": 20,
    "completedToday": 3,
    "dueSoon": 5,
    "completionRate": 65,
    "standAlone": 8,
    "linkedToAction": 7,
    "linkedToDream": 5,
    "byPriority": {
      "low": 5,
      "medium": 8,
      "high": 7
    },
    "totalTimeSpent": 480,
    "totalEstimatedTime": 600,
    "overdue": 2
  }
}
```



```
Dood-backend/
├── config/
│   └── db.js                  # Database connection
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── dreamController.js     # Dream management logic
│   ├── actionController.js    # Action management logic
│   ├── taskController.js      # Task management logic
│   ├── ideaController.js      # Idea management logic
│   └── noteController.js      # Note management logic
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── User.js               # User schema
│   ├── Dream.js              # Dream schema
│   ├── Action.js             # Action schema
│   ├── Task.js               # Task schema
│   ├── Idea.js               # Idea schema
│   └── Note.js               # Note schema
├── routes/
│   ├── authRoutes.js         # Auth routes
│   ├── dreamRoutes.js        # Dream routes
│   ├── actionRoutes.js       # Action routes
│   ├── taskRoutes.js         # Task routes
│   ├── ideaRoutes.js         # Idea routes
│   └── noteRoutes.js         # Note routes
├── utils/
│   └── email.js              # Email sending utility
├── index.js                  # Main application file
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
├── README.md                # Documentation
└── Dood-Backend-API.postman_collection.json  # Postman collection
```

## Features

✅ User Registration (Signup)
✅ User Login
✅ Forgot Password with OTP Email
✅ Reset Password with OTP Verification
✅ JWT Authentication
✅ Password Hashing with bcryptjs
✅ Input Validation
✅ Error Handling
✅ MongoDB Integration

### Dream Management Features
✅ Create Dreams (title, subtitle, description, type, priority, status, image, target date)
✅ View All Dreams with Filtering & Sorting
✅ View Single Dream
✅ Update Dream (Flexible Schema - update any field)
✅ Delete Dreams
✅ Track Progress (0-100%)
✅ Only One "Top" Priority Dream per User
✅ Dream Statistics & Summary
✅ Dream Types (work, achievement, relation, finance, home)
✅ Dream Status (in progress, slow down, boosted)
✅ Dream Priority Levels (low, medium, high, top)

### Action Management Features
✅ Create Actions (standalone or linked to dreams)
✅ View All Actions with Filtering & Sorting
✅ Get Actions for Specific Dream
✅ Update Action Details
✅ Mark Action as Completed (auto-sets completion date)
✅ Delete Actions
✅ Action Priorities (low, medium, high)
✅ Action Status (not started, in progress, completed)
✅ Due Dates & Timeline Tracking
✅ Action Statistics & Summary
✅ Track Actions Connected to Dreams vs Standalone

### Task Management Features
✅ Create Tasks (standalone, linked to actions, or linked to dreams)
✅ View All Tasks with Filtering & Sorting
✅ Get Tasks for Specific Action
✅ Get Tasks for Specific Dream
✅ Update Task Details
✅ Toggle Task Completion with Auto-completion Date
✅ Delete Tasks
✅ Task Priorities (low, medium, high)
✅ Time Tracking (timeSpent and estimatedTime in minutes)
✅ Due Dates & Timeline Tracking
✅ Multi-Level Linking (standalone, action-linked, dream-linked)
✅ Task Statistics & Summary
✅ Track Time Spent vs Estimated Time

### Idea Management Features
✅ Create Ideas (standalone or linked to dreams)
✅ View All Ideas with Filtering & Sorting
✅ Get Ideas for Specific Dream
✅ Update Idea Details
✅ Mark Idea as Implemented
✅ Delete Ideas
✅ Idea Priorities (low, medium, high)
✅ Idea Status (active, archived, implemented)
✅ Category and Tags Organization
✅ Implementation Notes Tracking
✅ Idea Statistics & Summary
✅ Track Ideas Connected to Dreams vs Standalone

### Note Management Features
✅ Create Notes (standalone or linked to dreams, actions, tasks, ideas)
✅ View All Notes with Filtering & Sorting
✅ Get Notes for Specific Resource (Dream/Action/Task/Idea)
✅ Get Standalone Notes
✅ Update Note Details
✅ Pin/Unpin Notes for Priority
✅ Delete Notes
✅ Tag Organization for Notes
✅ Flexible Resource Linking (dream, action, task, idea, standalone)
✅ Note Statistics & Summary (by type and pin status)
✅ Track Standalone Notes vs Resource-Linked Notes

## Ideas API

Ideas are brainstorming items and suggestions that can exist at multiple hierarchy levels:
- **Standalone**: Independent ideas not linked to any dream
- **Dream-linked**: Ideas linked to a specific dream for implementation

Ideas include category and tag organization, making them perfect for capturing inspiration and storing implementation notes.

#### 1. Create Idea - Standalone (POST)

**URL:** `/api/ideas`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Body:**

```json
{
  "title": "Mobile app redesign",
  "description": "Redesign mobile app UI/UX for better user experience",
  "priority": "high",
  "category": "Product",
  "tags": ["design", "mobile", "ui"],
  "notes": "Collaborate with design team"
}
```

**Note:** `dreamId` is optional. Omit it to create standalone idea.

**Response:**

```json
{
  "success": true,
  "message": "Idea created successfully",
  "idea": {
    "_id": "idea_id",
    "userId": "user_id",
    "title": "Mobile app redesign",
    "description": "Redesign mobile app UI/UX for better user experience",
    "priority": "high",
    "status": "active",
    "category": "Product",
    "tags": ["design", "mobile", "ui"],
    "dreamId": null,
    "createdAt": "2024-03-26T10:00:00.000Z"
  }
}
```

#### 2. Create Idea - For Dream (POST)

**URL:** `/api/ideas`

**Body:**

```json
{
  "title": "Use React hooks",
  "description": "Implement React hooks pattern for state management",
  "priority": "medium",
  "dreamId": "dreamIdHere",
  "category": "Development",
  "tags": ["react", "hooks", "frontend"],
  "notes": "Can improve performance and code reusability"
}
```

**Note:** This creates an idea linked directly to a dream.

#### 3. Get All Ideas (GET)

**URL:** `/api/ideas`

**Query Parameters (optional):**
- `status` - Filter: active, archived, implemented
- `priority` - Filter: low, medium, high
- `dreamId` - Get ideas for specific dream
- `sortBy` - Sort by: priority, createdAt, status

**Response:**

```json
{
  "success": true,
  "count": 12,
  "ideas": [...]
}
```

#### 4. Get Single Idea (GET)

**URL:** `/api/ideas/:id`

**Response:**

```json
{
  "success": true,
  "idea": {
    "_id": "idea_id",
    "userId": "user_id",
    "title": "Mobile app redesign",
    "priority": "high",
    "status": "active",
    "category": "Product",
    "tags": ["design", "mobile", "ui"],
    "dreamId": null,
    "createdAt": "2024-03-26T10:00:00.000Z"
  }
}
```

#### 5. Get Ideas for Specific Dream (GET)

**URL:** `/api/ideas/dream/:dreamId`

**Response:**

```json
{
  "success": true,
  "count": 5,
  "dreamTitle": "Learn Web Development",
  "ideas": [...]
}
```

#### 6. Update Idea (PUT)

**URL:** `/api/ideas/:id`

**Body:** (All fields optional)

```json
{
  "title": "Updated Idea Title",
  "priority": "high",
  "status": "active",
  "category": "New Category",
  "implementation": "Detailed implementation plan here",
  "tags": ["updated", "v2"],
  "notes": "Updated implementation notes"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Idea updated successfully",
  "idea": {...}
}
```

#### 7. Mark Idea as Implemented (PUT)

**URL:** `/api/ideas/:id/implement`

**Note:** This endpoint sets the idea status to "implemented".

**Response:**

```json
{
  "success": true,
  "message": "Idea marked as implemented",
  "idea": {
    "_id": "idea_id",
    "status": "implemented"
  }
}
```

#### 8. Delete Idea (DELETE)

**URL:** `/api/ideas/:id`

**Response:**

```json
{
  "success": true,
  "message": "Idea deleted successfully",
  "ideaId": "idea_id"
}
```

#### 9. Get Idea Statistics (GET)

**URL:** `/api/ideas/stats/summary`

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalIdeas": 20,
    "activeIdeas": 15,
    "implementedIdeas": 3,
    "archivedIdeas": 2,
    "linkedToDream": 8,
    "standalone": 12,
    "byPriority": {
      "low": 4,
      "medium": 10,
      "high": 6
    },
    "byStatus": {
      "active": 15,
      "archived": 2,
      "implemented": 3
    }
  }
}
```

## Notes API

Notes are now a separate, independent section that can be linked to Dreams, Actions, Tasks, Ideas, or exist as standalone items. This provides flexible note organization across your entire application.

### Features
✅ Standalone notes (not linked to anything)
✅ Dream-linked notes
✅ Action-linked notes
✅ Task-linked notes
✅ Idea-linked notes
✅ Pin important notes for quick access
✅ Tag notes for organization
✅ Full CRUD operations
✅ Note statistics and filtering

#### 1. Create Note (POST)

**URL:** `/api/notes`

**Headers:**

```
Authorization: Bearer jwt_token_here
```

**Body:**

```json
{
  "content": "This is my note content",
  "linkedType": "standalone",
  "tags": ["important", "work"],
  "isPinned": false
}
```

**For linked notes:**

```json
{
  "content": "Notes on dream progress",
  "linkedType": "dream",
  "linkedId": "dreamIdHere",
  "tags": ["progress"],
  "isPinned": true
}
```

**linkedType options:**
- `standalone` - Standalone note (linkedId must be null)
- `dream` - Linked to a dream (provide dreamId in linkedId)
- `action` - Linked to an action (provide actionId in linkedId)
- `task` - Linked to a task (provide taskId in linkedId)
- `idea` - Linked to an idea (provide ideaId in linkedId)

**Response:**

```json
{
  "success": true,
  "message": "Note created successfully",
  "note": {
    "_id": "note_id",
    "userId": "user_id",
    "content": "This is my note content",
    "linkedType": "standalone",
    "linkedId": null,
    "tags": ["important", "work"],
    "isPinned": false,
    "createdAt": "2024-03-26T10:00:00.000Z"
  }
}
```

#### 2. Get All Notes (GET)

**URL:** `/api/notes`

**Query Parameters (optional):**
- `linkedType` - Filter: standalone, dream, action, task, idea
- `linkedId` - Get notes for specific resource
- `isPinned` - Filter: true or false
- `sortBy` - Sort by: priority, createdAt

**Response:**

```json
{
  "success": true,
  "count": 15,
  "notes": [...]
}
```

#### 3. Get Single Note (GET)

**URL:** `/api/notes/:id`

**Response:**

```json
{
  "success": true,
  "note": {
    "_id": "note_id",
    "userId": "user_id",
    "content": "Note content here",
    "linkedType": "dream",
    "linkedId": "dream_id",
    "tags": ["important"],
    "isPinned": true
  }
}
```

#### 4. Get Notes for Specific Resource (GET)

**URL:** `/api/notes/:linkedType/:linkedId`

**Example:** `/api/notes/dream/dreamId`

**linkedType options:**
- `dream` - Get all notes linked to dream
- `action` - Get all notes linked to action
- `task` - Get all notes linked to task
- `idea` - Get all notes linked to idea

**Response:**

```json
{
  "success": true,
  "count": 5,
  "resourceType": "dream",
  "resourceTitle": "Learn Web Development",
  "notes": [...]
}
```

#### 5. Get Standalone Notes (GET)

**URL:** `/api/notes/standalone/list`

**Response:**

```json
{
  "success": true,
  "count": 8,
  "notes": [...]
}
```

#### 6. Update Note (PUT)

**URL:** `/api/notes/:id`

**Body:** (All fields optional)

```json
{
  "content": "Updated note content",
  "tags": ["updated", "v2"],
  "isPinned": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "Note updated successfully",
  "note": {...}
}
```

#### 7. Toggle Pin Status (PUT)

**URL:** `/api/notes/:id/toggle-pin`

**Note:** This endpoint toggles the isPinned flag.

**Response:**

```json
{
  "success": true,
  "message": "Note pin status toggled",
  "note": {
    "_id": "note_id",
    "isPinned": true
  }
}
```

#### 8. Delete Note (DELETE)

**URL:** `/api/notes/:id`

**Response:**

```json
{
  "success": true,
  "message": "Note deleted successfully",
  "noteId": "note_id"
}
```

#### 9. Get Note Statistics (GET)

**URL:** `/api/notes/stats/summary`

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalNotes": 25,
    "standaloneNotes": 10,
    "pinnedNotes": 8,
    "byType": {
      "standalone": 10,
      "dream": 5,
      "action": 4,
      "task": 3,
      "idea": 3
    }
  }
}
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `EMAIL_SERVICE` - Email service provider (gmail)
- `EMAIL_USER` - Email address for sending emails
- `EMAIL_PASSWORD` - Email password or app password
- `FRONTEND_URL` - Frontend URL for password reset link
- `NODE_ENV` - Environment (development/production)

## Notes

- Phone number must be exactly 10 digits
- Date of birth should be in ISO 8601 format (YYYY-MM-DD)
- Password must be at least 6 characters
- Username must be at least 3 characters
- Email must be unique in the database

### Dream Notes

- **Title & Subtitle**: Required fields for all dreams
- **Type**: Must be one of: work, achievement, relation, finance, home
- **Priority**: low, medium, high, or top (only one dream can be "top" per user)
- **Status**: in progress, slow down, or boosted
- **Progress**: Integer between 0-100 representing completion percentage
- **Image**: Optional URL for dream image
- **Target Date**: Optional deadline for dream completion
- **Notes**: Array of notes - use `/add-note` and `/notes/:index` endpoints to manage
- **Flexible Schema**: All dream fields except userId and type can be updated later
- **Timeline**: Automatically set to current date when dream is created
- **Authentication**: All dream routes require JWT token in Authorization header

### Action Notes

- **Title**: Required field for actions
- **Description**: Optional, max 500 characters
- **Priority**: low, medium, or high (different from dreams which have "top")
- **Status**: not started, in progress, or completed
- **Due Date**: Optional deadline for action
- **Notes**: Array of notes - use `/add-note` and `/notes/:index` endpoints to manage
- **Dream Link**: Optional `dreamId` to link action to a specific dream
- **Standalone Actions**: Actions can exist independently without a dream link
- **Completion Date**: Automatically set when marked as completed
- **Flexible Schema**: All action fields can be updated anytime
- **Authentication**: All action routes require JWT token in Authorization header
- **Statistics**: Track actions connected to dreams vs standalone, due soon, and completed today

### Task Notes

- **Title**: Required field for all tasks
- **Description**: Optional, detailed description of the task
- **Priority**: low, medium, or high
- **Multi-Level Linking**: Tasks can be:
  - **Standalone**: No `actionId` or `dreamId` - independent task
  - **Action-Linked**: `actionId` provided - task linked to specific action
  - **Dream-Linked**: `dreamId` provided - task linked directly to dream (without action)
  - **Auto-Inheritance**: If task linked to action that's linked to dream, `dreamId` is auto-set
- **Completion**: 
  - `isCompleted` flag (boolean toggle)
  - `completedDate` auto-set when marked complete
  - Can be toggled back to incomplete
- **Notes**: Array of notes - use `/add-note` and `/notes/:index` endpoints to manage
- **Time Tracking**:
  - `timeSpent`: Minutes spent on task (accumulated)
  - `estimatedTime`: Optional estimated minutes needed
  - Use `/add-time` endpoint to log time
- **Due Date**: Optional deadline
- **Flexible Schema**: All task fields can be updated anytime
- **Authentication**: All task routes require JWT token in Authorization header
- **Statistics**: Track standalone vs linked tasks, completion rates, time metrics, and overdue items
### Idea Notes

- **Title**: Required field for all ideas
- **Description**: Optional, detailed description of the idea
- **Priority**: low, medium, or high
- **Status**: active, archived, or implemented
  - **Active**: Idea is being considered/developed
  - **Archived**: Idea is no longer relevant
  - **Implemented**: Idea has been completed/implemented
- **Category**: Optional category for organizing ideas (e.g., Product, Development, Design)
- **Tags**: Optional array of tags for flexible organization and search
- **Notes**: Array of notes - use `/add-note` and `/notes/:index` endpoints to manage
- **Dream Linking**: 
  - `dreamId` optional - link idea to a specific dream
  - Ideas can also be standalone without dream linkage
- **Implementation**: Optional field for storing implementation details or plan
- **Flexible Schema**: All idea fields can be updated anytime
- **Authentication**: All idea routes require JWT token in Authorization header
- **Statistics**: Track ideas by status, priority, and dream linkage