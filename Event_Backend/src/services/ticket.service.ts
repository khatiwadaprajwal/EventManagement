import  prisma  from '../config/db';
import { AppError } from '../utils/AppError';

export const verifyTicket = async (qrCode: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: { qrCode },
    include: {
      seat: true,
      booking: {
        include: { user: true, event: true }
      }
    }
  });

  if (!ticket) throw new AppError('Invalid Ticket', 404);

  return {
    valid: true,
    event: ticket.booking.event.title,
    seat: ticket.seat.seatNumber,
    category: ticket.seat.category,
    holder: ticket.booking.user.name,
    date: ticket.booking.event.date
  };
};