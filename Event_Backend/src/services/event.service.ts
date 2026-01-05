import  prisma  from '../config/db';
import { AppError } from '../utils/AppError';
import { ApiFeatures } from '../utils/ApiFeatures';

// --- CREATE EVENT ---
export const createEvent = async (data: any) => {
  const { seatConfig, ...eventData } = data; // seatConfig comes from Zod

  return await prisma.$transaction(async (tx) => {
    // 1. Create Event
    const event = await tx.event.create({
      data: eventData,
    });

    // 2. Generate Seats based on Tiers
    // Example Config: [{ category: 'VIP', count: 10, price: 5000 }, { category: 'GEN', count: 50, price: 1000 }]
    const seatsData: any[] = [];

    seatConfig.forEach((tier: any) => {
      for (let i = 1; i <= tier.count; i++) {
        seatsData.push({
          eventId: event.id,
          // Result: VIP-001, VIP-002 ... GEN-001 ...
          seatNumber: `${tier.category.toUpperCase().substring(0, 3)}-${i.toString().padStart(3, '0')}`,
          price: tier.price,
          category: tier.category, // Save the category name
          status: 'AVAILABLE',
        });
      }
    });

    await tx.seat.createMany({ data: seatsData });

    return event;
  });
};

// --- UPDATE EVENT ---
export const updateEvent = async (id: number, data: any) => {
  // Check if exists
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError('Event not found', 404);

  // Note: We are NOT updating seats here because that is complex 
  // (what if seats are already booked?). 
  // We only update basic details and images.
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: data,
  });

  return updatedEvent;
};


// --- GET ALL EVENTS (With Filter/Sort/Page) ---
export const getAllEvents = async (query: any) => {
  // Initialize Prisma Query Object
  const prismaQuery: any = { 
    where: {}, 
    include: { 
      _count: { select: { seats: true } },
      
     
      bookings: {
        where: { status: 'CONFIRMED' }, 
        select: { totalAmount: true }  
      }
    } 
  };

  // Apply Features (Filter, Sort, Paginate)
  const features = new ApiFeatures(prismaQuery, query)
    .filter()
    .sort()
    .paginate();

  // Execute Query
  const events = await prisma.event.findMany(features.query);
  const total = await prisma.event.count({ where: features.query.where });

  // Note: Ensure your Controller sends this 'events' array to the frontend
  return { events, total };
};


export const getEvent = async (id: number) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      seats: {
        orderBy: { seatNumber: 'asc' }, 
      },
      
      bookings: {
        where: { status: 'CONFIRMED' },
        select: { totalAmount: true }
      }
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // 👇 2. Calculate Revenue on the Backend
  const totalRevenue = event.bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
  const ticketsSold = event.bookings.length;

  // 👇 3. Return Event with added Stats
  return {
    ...event,
    totalRevenue, // Now accessible as event.totalRevenue
    ticketsSold
  };
};

// --- DELETE EVENT ---


export const deleteEvent = async (id: number) => {
  const event = await prisma.event.findUnique({ where: { id } });
  
  if (!event) {
    throw new AppError('Event not found', 404);
  }
  await getEvent(id); 
  await prisma.event.delete({ where: { id } }); 
};

// export const deleteEvent = async (id: number) => {
//   const event = await getEvent(id);
//   const hasTickets = await prisma.ticket.findFirst({ where: { eventId: id } });
//   if (hasTickets) throw new AppError('Cannot delete event with active bookings', 400);

//   return prisma.event.delete({ where: { id } });
// };
