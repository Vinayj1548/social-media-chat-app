# social-media-chat-app

# Project Setup Guide

## Prerequisites
Make sure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) account and connection string
- [Nodemon](https://www.npmjs.com/package/nodemon) (For backend development, install globally if needed: `npm install -g nodemon`)

## Installation Steps

### 1. Clone the Repository
```sh
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Open Both Folders in Separate Terminals
Open two terminal windows:
- One for the **backend**
- One for the **frontend**

### 3. Install Dependencies
Run the following command in both the **backend** and **frontend** folders:
```sh
npm install
```

### 4. Configure MongoDB Atlas
Replace the MongoDB Atlas connection string in `backend/db.js` with your own connection string:
```js
const mongoose = require('mongoose');

mongoose.connect('your-mongodb-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));
```

### 5. Run the Backend Server
In the **backend** folder, run:
```sh
nodemon server.js
```
This will start your backend server and automatically restart it when changes are made.

### 6. Run the Frontend Application
In the **frontend** folder, run:
```sh
npm run dev
```
This will start the frontend development server.

### 7. Open the Application
Once both servers are running, open your browser and visit:
```sh
http://localhost:5173
```
(The default port for Vite or Next.js frontend development server)

## Additional Notes
- Ensure that both frontend and backend are properly connected by checking network requests in the browser console.
- If there are any issues, check the logs in the terminal for debugging.

## Happy Coding! 🚀
