🎟️ Event Management & Ticket Booking System (Backend)

A production-ready, high-concurrency backend for event & ticket booking platforms (concerts, shows, conferences).
Built with TypeScript, Prisma, PostgreSQL, focusing on seat locking, transactional safety, and secure authentication.

🚀 Key Features

🔒 High Concurrency Handling

Prevents double booking

Seat locking with Prisma transactions

Atomic booking & payment flow

🛡️ Security First

JWT Access + HttpOnly Refresh tokens

Role-Based Access Control (RBAC)

Centralized error handling

✅ Validation-First Architecture

Zod schema validation

Invalid data blocked before controllers

Runtime + compile-time safety

🧱 Clean Architecture

Thin controllers

Service layer for business logic

Reusable utilities & middlewares

🧰 Tech Stack (Backend Priority)

Runtime: Node.js v20+

Language: TypeScript (Strict Mode)

Framework: Express.js

Database: PostgreSQL

ORM: Prisma v5+

Validation: Zod

Authentication: JWT (Access + Refresh)

Authorization: RBAC (USER / ORGANIZER / ADMIN)

File Uploads: Multer (Memory Storage)

Infrastructure: Docker + Docker Compose

📁 Backend Folder Structure (Clean)
Event_Backend/
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/              # App & service configs
│   ├── controllers/         # Thin request handlers
│   ├── services/            # Business logic
│   ├── middlewares/         # Auth, validation, errors
│   ├── routes/              # Route definitions
│   ├── validators/          # Zod schemas (BEFORE controllers)
│   ├── utils/               # Shared helpers
│   ├── types/               # Type augmentation
│   ├── app.ts               # Express setup
│   └── server.ts            # Entry point
│
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
├── tsconfig.json
└── README.md

🔄 Request Lifecycle (Validation-First)
Client
 → Route
 → Zod Validation
 → Auth Middleware
 → Role Middleware
 → Controller
 → Service
 → Prisma Transaction
 → JSON Response


❗ Invalid input never reaches controllers

🔐 Authentication Model
Access Token

Sent via Authorization: Bearer <token>

Short-lived

Contains userId & role

Refresh Token

Stored in HttpOnly cookie

Auto-rotated

Protected from XSS

🧠 Concurrency & Seat Locking

Problem: Multiple users selecting the same seat
Solution: Prisma $transaction

await prisma.$transaction(async (tx) => {
  const seats = await tx.seat.findMany({
    where: { id: { in: seatIds }, status: 'AVAILABLE' },
  });

  if (seats.length !== seatIds.length) {
    throw new AppError('Some seats already booked', 409);
  }

  const booking = await tx.booking.create({
    data: { /* booking data */ },
  });

  await tx.seat.updateMany({
    where: { id: { in: seatIds } },
    data: { status: 'BOOKED' },
  });

  return booking;
});


✔ No race conditions
✔ All-or-nothing execution
✔ Database-level safety

🧪 Validation Example (Zod)
// validators/booking.schema.ts
export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.number(),
    seatIds: z.array(z.number()).min(1),
  }),
});

// routes/booking.routes.ts
router.post(
  '/',
  protect,
  validate(createBookingSchema),
  bookingController.createBooking
);

▶️ Getting Started
# Install deps
npm install

# Start database
docker-compose up -d

# Migrate DB
npx prisma migrate dev
npx prisma generate

# Start server
npm run dev


Server runs on:

http://localhost:8000
