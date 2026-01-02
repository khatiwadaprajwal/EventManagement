import  prisma  from '../config/db';
import { AppError } from '../utils/AppError';
import { ApiFeatures } from '../utils/ApiFeatures';

// --- CREATE EVENT ---
export const createEvent = async (data: any) => {
  const { totalSeats, pricePerSeat, ...eventData } = data;

  // Transaction: Create Event + Generate Seats
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Event
    const event = await tx.event.create({
      data: eventData,
    });

    // 2. Generate Seats (Simple Logic: Seat #1 to #N)
    // In a real app, you might have Row/Col logic (A1, A2...)
    const seatsData = Array.from({ length: totalSeats }, (_, i) => ({
      eventId: event.id,
      seatNumber: `S-${i + 1}`,
      price: pricePerSeat,
      status: 'AVAILABLE' as const, // Type assertion for Enum
    }));

    await tx.seat.createMany({
      data: seatsData,
    });

    return event;
  });

  return result;
};

// --- GET ALL EVENTS (With Filter/Sort/Page) ---
export const getAllEvents = async (query: any) => {
  // Initialize Prisma Query Object
  const prismaQuery: any = { where: {}, include: { _count: { select: { seats: true } } } };

  // Apply Features
  const features = new ApiFeatures(prismaQuery, query)
    .filter()
    .sort()
    .paginate();

  // Execute Query
  const events = await prisma.event.findMany(features.query);
  const total = await prisma.event.count({ where: features.query.where });

  return { events, total };
};

// --- GET EVENT BY ID ---
export const getEvent = async (id: number) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      seats: {
        orderBy: { seatNumber: 'asc' }, // Show seats in order
      }, 
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  return event;
};

// --- DELETE EVENT ---
export const deleteEvent = async (id: number) => {
  // Check existence
  await getEvent(id);
  
  await prisma.event.delete({ where: { id } });
  return null;
};