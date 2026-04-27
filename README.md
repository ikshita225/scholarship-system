# Scholarship System

A comprehensive full-stack web application for managing scholarship applications, verification, and student documentation. Built with Spring Boot backend and React frontend.

## 🚀 Features

- **Student Dashboard**: Submit scholarship applications and manage documents
- **Admin Dashboard**: Review and manage scholarship listings and applications
- **Verifier Dashboard**: Verify and review student applications and documents
- **Authentication**: Secure JWT-based authentication system
- **Document Management**: Upload and manage scholarship documents
- **User Roles**: Support for Students, Admins, and Verifiers with role-based access
- **Help System**: Help request management system
- **Responsive Design**: Mobile-friendly user interface

## 🛠️ Tech Stack

### Backend
- **Java 11+** - Programming language
- **Spring Boot** - REST API framework
- **Spring Security** - Authentication & Authorization
- **Spring Data JPA** - Database ORM
- **MySQL/PostgreSQL** - Relational database
- **JWT** - Token-based authentication
- **Maven** - Dependency management

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling

## 📁 Project Structure

```
Scholarship System/
├── backend/                          # Spring Boot backend application
│   ├── src/
│   │   ├── main/java/com/scholarship/
│   │   │   ├── controller/          # REST API endpoints
│   │   │   ├── service/             # Business logic
│   │   │   ├── model/               # Database entities
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── security/            # JWT & Security config
│   │   │   ├── exception/           # Exception handling
│   │   │   └── config/              # Application config
│   │   └── resources/
│   │       └── application.yml      # Configuration file
│   ├── pom.xml                      # Maven dependencies
│   ├── Dockerfile                   # Docker container config
│   └── package.json                 # Node dependencies (if needed)
│
└── frontend/                         # React Vite application
    ├── src/
    │   ├── components/              # Reusable React components
    │   ├── pages/                   # Page components
    │   ├── context/                 # State management
    │   ├── api/                     # API integration
    │   ├── assets/                  # Images & static files
    │   ├── App.jsx                  # Main app component
    │   └── main.jsx                 # Entry point
    ├── vite.config.js               # Vite configuration
    ├── package.json                 # NPM dependencies
    └── vercel.json                  # Deployment config
```

## 📋 Prerequisites

- **Java Development Kit (JDK)** 11 or higher
- **Node.js** 16+ and **npm** 7+
- **Maven** 3.6+
- **Git**
- **MySQL** 5.7+ or **PostgreSQL** 12+ (Database)

## ⚙️ Installation

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/scholarship-system.git
cd scholarship-system/backend
```

2. Configure the database in `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/scholarship_db
    username: root
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
```

3. Build the project:
```bash
mvn clean install
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file for API configuration (if needed):
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🚀 Running the Application

### Start Backend Server

From the `backend` directory:
```bash
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### Start Frontend Development Server

From the `frontend` directory:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for secure authentication:

- Users log in with credentials
- Server returns a JWT token
- Client stores the token and sends it with each request
- Server validates the token for protected endpoints

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Student
- `GET /api/student/dashboard` - Get student dashboard data
- `POST /api/student/applications` - Submit new application
- `GET /api/student/applications` - Get user's applications
- `POST /api/student/documents` - Upload document

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/scholarships` - List all scholarships
- `POST /api/admin/scholarships` - Create new scholarship
- `PUT /api/admin/scholarships/{id}` - Update scholarship

### Verifier
- `GET /api/verifier/dashboard` - Get verifier dashboard data
- `GET /api/verifier/applications` - Get applications to verify
- `PUT /api/verifier/applications/{id}` - Update application status

## 🐳 Docker Deployment

Build the Docker image:
```bash
docker build -t scholarship-system:latest ./backend
```

Run the container:
```bash
docker run -p 8080:8080 scholarship-system:latest
```

## 📦 Building for Production

### Backend
```bash
mvn clean package -DskipTests
```

### Frontend
```bash
npm run build
```

The production build will be in the `dist/` folder.

## 🚢 Deployment

### Deploy on Vercel (Frontend)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the frontend and build it
4. Configure environment variables for API endpoints

### Deploy on Heroku/AWS (Backend)
1. Create a JAR file: `mvn clean package`
2. Deploy using your preferred cloud platform
3. Configure database connection on the platform
4. Set up environment variables

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Development

### Backend Development
- Review Java code in `backend/src/main/java/com/scholarship/`
- Database entities are in `model/` package
- Business logic in `service/` package
- API endpoints in `controller/` package

### Frontend Development
- Review React components in `frontend/src/components/`
- Page layouts in `frontend/src/pages/`
- State management in `frontend/src/context/`
- API calls in `frontend/src/api/`

## ⚠️ Important Notes

- Keep your JWT secret key secure and never commit it to version control
- Use environment variables for sensitive information
- Follow the existing code structure and conventions
- Test thoroughly before deploying to production

## 📧 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error messages and screenshots if applicable

## 🎯 Future Enhancements

- [ ] Email notifications for application status
- [ ] PDF report generation
- [ ] Advanced filtering and search
- [ ] Application timeline tracking
- [ ] Bulk document upload
- [ ] Integration with payment gateways
- [ ] Multi-language support
- [ ] Mobile app (React Native)

---

**Last Updated:** April 2026
