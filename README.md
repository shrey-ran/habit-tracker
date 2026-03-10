# 🎯 Habit Tracker

A full-stack habit tracking application that helps users build and maintain productive daily habits. Track your progress, build streaks, and achieve your goals with an intuitive and responsive interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.0-61dafb)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [Future Enhancements](#future-enhancements)
- [License](#license)
- [Author](#author)

## ✨ Features

- ✅ Create and manage daily habits
- 📊 Track completion status and progress
- 🔥 View habit streaks and statistics
- 💾 Persistent data storage with MongoDB
- 🎨 Clean and intuitive user interface
- ⚡ Fast and responsive React frontend
- 🔒 RESTful API with CORS support

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern UI library
- **Vite** - Next-generation frontend tooling
- **ESLint** - Code quality and consistency

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 9** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **MongoDB** (v5.0 or higher) - Running locally or cloud instance (MongoDB Atlas)
- **Git** - For version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/shrey-ran/habit-tracker.git
cd habit-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habit-tracker
# Or use MongoDB Atlas connection string:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/habit-tracker
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

The backend uses environment variables for configuration. Create a `.env` file in the `backend` directory with the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/habit-tracker |

### Frontend Configuration

The frontend is configured to connect to the backend API. If you change the backend port, update the API URL in the frontend code accordingly.

## 💻 Usage

### Development Mode

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Start the Backend Server**:
   ```bash
   cd backend
   npm start
   ```
   The backend server will run on `http://localhost:5000`

3. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

4. Open your browser and navigate to `http://localhost:5173`

### Production Build

To create a production build of the frontend:

```bash
cd frontend
npm run build
```

The optimized files will be in the `frontend/dist` directory.

## 📁 Project Structure

```
habit-tracker/
├── backend/
│   ├── models.js           # Database models (Mongoose schemas)
│   ├── server.js           # Express server configuration
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (create this)
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # React entry point
│   │   ├── index.css      # Global styles
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   ├── eslint.config.js   # ESLint configuration
│   └── package.json       # Frontend dependencies
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/habits` | Get all habits |
| POST | `/api/habits` | Create a new habit |
| GET | `/api/habits/:id` | Get a specific habit |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |

*(Note: Update this section based on actual API implementation)*

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 🚧 Future Enhancements

- [ ] User authentication and authorization
- [ ] Habit analytics dashboard with charts
- [ ] Email/SMS reminder notifications
- [ ] Mobile responsive design improvements
- [ ] Dark mode support
- [ ] Habit categories and tags
- [ ] Social features (share habits with friends)
- [ ] Data export functionality
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Shreyansh Ranjan**

- GitHub: [@shrey-ran](https://github.com/shrey-ran)

---

⭐ If you found this project helpful, please consider giving it a star!

**Built with ❤️ using React and Node.js**
