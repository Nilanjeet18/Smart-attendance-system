# 🚀 Smart Attendance System

A full-stack Smart Attendance System application built with Java Backend and React Frontend, designed to efficiently manage and automate business operations.

---

## ✨ Features

- 🔐 User Authentication & Authorization
- 📊 Dashboard & Analytics
- 📝 CRUD Operations
- 📂 Data Management
- 📈 Reports & Statistics
- 📱 Responsive UI Design
- ⚡ Real-time Updates
- 🔍 Search & Filter Functionality

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Tailwind CSS

### Backend

- Java
- Spring Boot
- Spring Security
- Hibernate / JPA
- REST API

### Database

- MySQL

### Tools

- Git & GitHub
- Postman
- VS Code
- STS ( Spring Tool Suite )

---

## 📋 Prerequisites

Before running this application, make sure you have installed:

- Java JDK 17+
- Maven
- MySQL Server
- Git

---

## 🔧 Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Nilanjeet18/Smart-attendance-system.git

cd Smart-attendance-system
```

### 2. Backend Setup

```bash
cd Backend

# Configure application.properties

spring.datasource.url=jdbc:mysql://localhost:3306/smart_attendance_db
spring.datasource.username=your_username
spring.datasource.password=your_password
```

Run Backend

```bash
mvn clean install

mvn spring-boot:run
```

Backend URL

```bash
http://localhost:8080
```

---

### 3. Frontend Setup

```bash
cd Frontend

npm install

npm run dev
```

Frontend URL

```bash
http://localhost:5173
```

---

### 4. Database Setup

```sql
CREATE DATABASE smart_attendance_db;
```

Tables will be created automatically if configured.

---

## 🎯 Usage

### Login

```text
Username: admin@example.com
Password: admin123
```

### Main Modules

- Dashboard
- User Management
- Product Management
- Reports
- Settings

---

## 📂 Project Structure

```text
Project-Name/

├── Backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🔑 API Endpoints

### Authentication

```http
POST /api/auth/login
POST /api/auth/register
```

### Attendance

```http
POST /api/attendance/sessions/start
PUT  /api/attendance/sessions/{sessionId}/close
GET  /api/attendance/sessions/course/{courseId}
GET  /api/attendance/sessions/date/{date}
GET  /api/attendance/sessions/my/date/{date}

```

### Student

```http
POST /api/students
GET  /api/students/{id}
GET  /api/students/roll/{rollNumber}
GET  /api/students/course/{courseId}

```

### Teacher

```http

GET /api/teachers/{id}
PUT /api/teachers/{id}
DELETE /api/teachers/{id}

```

### Reports

```http
GET /api/reports/course/{courseId}
GET /api/reports/course/{courseId}/excel
GET /api/reports/course/{courseId}/pdf
GET /api/reports/course/{courseId}/at-risk
```

## 🔒 Security Features

- JWT Authentication
- Password Encryption
- Role-Based Access Control
- Secure REST APIs

---

## 🚀 Future Enhancements

- Email Notifications
- AI-Based Analytics

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the Repository
2. Create Feature Branch

```bash
git checkout -b feature/NewFeature
```

3. Commit Changes

```bash
git commit -m "Added New Feature"
```

4. Push Changes

```bash
git push origin feature/NewFeature
```

5. Create Pull Request

---

## 👨‍💻 Author

**Nilanjeet Gugale**

- GitHub: [https://github.com/Nilanjeet18]
- LinkedIn: [https://www.linkedin.com/in/nilanjeet-gugale-b06534252/]
- Email: [nilanjeetgugale@gmail.com]

---

## 🙏 Acknowledgements

- Spring Boot Documentation
- React Documentation
- Open Source Community

---

## 📞 Support

For support:

📧 [nilanjeetgugale@gmail.com]

---

⭐ If you found this project useful, please give it a Star.
