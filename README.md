🎟️ Event Management & Ticket Booking System

A high-performance, production-ready event and ticket booking backend built with modern TypeScript, designed to handle concurrent bookings, seat locking, and secure payment processing.



📋 Table of Contents

Features
Tech Stack
Project Structure
Request Flow
Getting Started
API Documentation
Authentication
Security & Concurrency
Scripts
Deployment


✨ Features
<table>
<tr>
<td>
🔒 High Concurrency Handling

Prevents double bookings
Prisma transactions
Seat locking mechanism

🛡️ Security First

JWT authentication
HttpOnly refresh tokens
Role-Based Access Control

</td>
<td>
✅ Validation-First Architecture

Zod schema validation
Type-safe inputs
Early error detection

🎯 Clean Architecture

Separation of concerns
Service layer pattern
Reusable components

</td>
</tr>
</table>

🚀 Tech Stack
┌─────────────────────────────────────────────────────────────┐
│  Runtime         │  Node.js v20+                            │
│  Language        │  TypeScript (Strict Mode)                │
│  Framework       │  Express.js                              │
│  Database        │  PostgreSQL                              │
│  ORM             │  Prisma v5+                              │
│  Validation      │  Zod                                     │
│  Authentication  │  JWT (Access + Refresh Token)            │
│  Authorization   │  RBAC (Role-Based Access Control)        │
│  File Upload     │  Multer                                  │
│  Container       │  Docker & Docker Compose                 │
└─────────────────────────────────────────────────────────────┘

📁 Project Structure
Event_Backend/
│
├── 📂 prisma/
│   └── schema.prisma                 # Database schema & models
│
├── 📂 src/
│   │
│   ├── 📂 config/                    # App configuration
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── env.ts                    # Zod-validated environment
│   │   └── cloudinary.ts             # Image upload config
│   │
│   ├── 📂 controllers/               # Request handlers (thin)
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── booking.controller.ts
│   │   └── payment.controller.ts
│   │
│   ├── 📂 middlewares/               # Express middleware
│   │   ├── validate.middleware.ts    # Zod validation executor
│   │   ├── auth.middleware.ts        # JWT verification
│   │   ├── role.middleware.ts        # RBAC authorization
│   │   └── error.middleware.ts       # Global error handler
│   │
│   ├── 📂 routes/                    # API routes
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── booking.routes.ts
│   │   └── payment.routes.ts
│   │
│   ├── 📂 services/                  # Business logic
│   │   ├── auth.service.ts
│   │   ├── event.service.ts
│   │   ├── booking.service.ts
│   │   └── payment.service.ts
│   │
│   ├── 📂 validators/                # Zod schemas
│   │   ├── auth.schema.ts
│   │   ├── event.schema.ts
│   │   ├── booking.schema.ts
│   │   └── payment.schema.ts
│   │
│   ├── 📂 types/                     # TypeScript definitions
│   │   └── express.d.ts
│   │
│   ├── 📂 utils/                     # Utilities
│   │   ├── AppError.ts
│   │   ├── catchAsync.ts
│   │   ├── sendResponse.ts
│   │   └── tokenGenerate.ts
│   │
│   ├── app.ts                        # Express app setup
│   └── server.ts                     # Entry point
│
├── 📄 docker-compose.yml
├── 📄 Dockerfile
├── 📄 .env.example
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 README.md

🔄 Request Flow

Validation-First Architecture: Invalid data never reaches controllers

mermaidgraph TD
    A[Client Request] --> B[Route Handler]
    B --> C[Zod Validation]
    C --> D[Auth Middleware]
    D --> E[Role Middleware]
    E --> F[Controller]
    F --> G[Service Layer]
    G --> H[Prisma Transaction]
    H --> I[JSON Response]
    
    C -.->|Invalid Data| J[400 Bad Request]
    D -.->|Unauthorized| K[401 Unauthorized]
    E -.->|Forbidden| L[403 Forbidden]
Flow Breakdown:

Route → Receives the request
Validator → Zod validates request schema
Auth → JWT token verification
Role → Permission check (RBAC)
Controller → Orchestration only
Service → Business logic execution
Prisma → Database operations
Response → JSON formatted response


🛠️ Getting Started
Prerequisites
bash✓ Node.js v20 or higher
✓ Docker & Docker Compose
✓ npm or yarn
Installation
1. Clone the repository
bashgit clone <repository-url>
cd Event_Backend
2. Install dependencies
bashnpm install
3. Configure environment variables
bashcp .env.example .env
Update .env with your configuration:
env# Server
NODE_ENV=development
PORT=8000

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/event_db"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
4. Start PostgreSQL with Docker
bashdocker-compose up -d
5. Run database migrations
bashnpx prisma migrate dev
npx prisma generate
6. Start development server
bashnpm run dev
🎉 Server running at: http://localhost:8000

📚 API Documentation
🔐 Authentication Endpoints
MethodEndpointDescriptionAuthPOST/api/auth/registerRegister new user❌POST/api/auth/loginUser login❌POST/api/auth/refreshRefresh access token❌POST/api/auth/logoutLogout user✅GET/api/auth/meGet current user✅
🎫 Event Endpoints
MethodEndpointDescriptionAuthRoleGET/api/eventsGet all events❌-GET/api/events/:idGet event details❌-POST/api/eventsCreate new event✅ORGANIZERPATCH/api/events/:idUpdate event✅ORGANIZERDELETE/api/events/:idDelete event✅ADMIN
🎟️ Booking Endpoints
MethodEndpointDescriptionAuthRolePOST/api/bookingsCreate booking✅USERGET/api/bookings/my-bookingsGet user bookings✅USERGET/api/bookings/:idGet booking details✅USERDELETE/api/bookings/:idCancel booking✅USER
💳 Payment Endpoints
MethodEndpointDescriptionAuthPOST/api/payments/initiateInitiate payment✅POST/api/payments/verifyVerify payment✅GET/api/payments/:idGet payment details✅

🔐 Authentication Flow
Access Token
├─ Storage: Authorization Header
├─ Format: Bearer <token>
├─ Lifetime: 7 days (default)
└─ Contains: userId, role, email
Refresh Token
├─ Storage: HttpOnly Cookie
├─ Lifetime: 30 days (default)
├─ Purpose: Generate new access tokens
└─ Protection: Cannot be accessed via JavaScript (XSS protection)

🔒 Security & Concurrency
Role-Based Access Control (RBAC)
RolePermissions👤 USERBook tickets, View own bookings, Manage profile📋 ORGANIZERAll USER permissions + Create/Edit events👑 ADMINAll permissions + User management, System config
Concurrency Handling
Problem: Multiple users booking the same seat simultaneously
Solution: Prisma transactions with pessimistic locking
typescript// Atomic seat booking
await prisma.$transaction(async (tx) => {
  // 1. Lock and verify seat availability
  const seats = await tx.seat.findMany({
    where: { 
      id: { in: seatIds }, 
      isBooked: false 
    }
  });
  
  // 2. Validate all seats are available
  if (seats.length !== seatIds.length) {
    throw new AppError('Some seats unavailable', 409);
  }
  
  // 3. Create booking atomically
  const booking = await tx.booking.create({
    data: { /* booking data */ }
  });
  
  // 4. Mark seats as booked
  await tx.seat.updateMany({
    where: { id: { in: seatIds } },
    data: { isBooked: true }
  });
  
  return booking;
});
Benefits:

✅ Prevents double booking
✅ All-or-nothing operations
✅ Database-level locking
✅ Race condition protection


🧪 Validation Example
All routes use Zod for runtime type validation:
typescript// validators/booking.schema.ts
import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string().uuid('Invalid event ID'),
    seatIds: z.array(z.string().uuid())
      .min(1, 'Select at least 1 seat')
      .max(10, 'Maximum 10 seats per booking'),
    paymentMethod: z.enum(['CARD', 'KHALTI', 'ESEWA'])
  })
});

// routes/booking.routes.ts
router.post(
  '/',
  protect,                          // JWT authentication
  validate(createBookingSchema),    // Zod validation
  bookingController.createBooking   // Controller
);

🧰 Available Scripts
CommandDescriptionnpm run devStart development server with hot reloadnpm run buildBuild TypeScript to JavaScriptnpm run startStart production servernpm run lintRun ESLintnpm run formatFormat code with Prettiernpm run migrateRun Prisma migrationsnpm run studioOpen Prisma Studio (Database GUI)

🐳 Docker Commands
bash# Start PostgreSQL container
docker-compose up -d

# Stop container
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database (⚠️ Deletes all data)
docker-compose down -v
docker-compose up -d

🚀 Deployment
Production Build
bash# Build the application
npm run build



🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch: git checkout -b feature/amazing-feature
Commit your changes: git commit -m 'Add amazing feature'
Push to branch: git push origin feature/amazing-feature
Open a Pull Request

Code Style

Follow existing TypeScript patterns
Use Prettier for formatting
Write meaningful commit messages
Add tests for new features



🙏 Acknowledgments
Built with amazing open-source technologies:

Express.js - Fast, minimalist web framework
Prisma - Next-generation ORM
PostgreSQL - Advanced open-source database
Zod - TypeScript-first schema validation
JWT - JSON Web Tokens





<div align="center">
⬆ back to top
Made with ❤️ using TypeScript and Node.js
⭐ Star this repo if you find it helpful!
</div>
