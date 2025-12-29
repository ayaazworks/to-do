# 📝 MERN Stack To-Do App with Virtualization

A high-performance Task Management application built with the MERN stack (MongoDB, Express, React, Node.js). 

This project goes beyond a standard To-Do app by implementing **Server-Side Pagination**, **Infinite Scrolling**, and **Windowing/Virtualization** to handle large datasets efficiently.

## 🚀 Key Features

### 🔐 Authentication & Security
* **Multi-User Support:** Secure User Registration and Login.
* **Data Isolation:** Users can strictly access, edit, and delete *only* their own tasks.
* **JWT Authentication:** Protected routes using JSON Web Tokens.

### ⚡ High Performance Frontend
* **Infinite Scrolling:** Automatically fetches data as the user scrolls, reducing initial load time.
* **Virtualization:** Uses `react-virtuoso` to render only the visible DOM nodes. 
    * *Result:* The app remains buttery smooth even with 10,000+ tasks in the list.

### 🛠 Task Management
* **CRUD Operations:** Create, Read, Update, and Delete tasks.
* **Bulk Actions:** Select and delete multiple tasks simultaneously.
* **Optimistic UI Updates:** Interface updates immediately upon deletion for a snappy user experience.

---

## 💻 Tech Stack

**Frontend:**
* React.js
* React Router DOM
* React Virtuoso (for Virtualization)
* CSS3 (Flexbox/Grid Layouts)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* JWT (JSON Web Tokens) for Auth

## 🛠️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

bash- git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name 

bash- npm install (INSTALL DEPENDENCIES)

make .env file and add MONGO (MONGO DB Cluster details which has database name first-project and two collections in it todo and users) and JWT_SECRET(SECRET KEY FOR JWT SIGN AND VERIFY)

bash- npx nodemon index.js

bash- npm run dev
