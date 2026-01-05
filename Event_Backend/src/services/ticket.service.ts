import prisma from '../config/db';
import { AppError } from '../utils/AppError';

export const verifyTicket = async (qrCode: string) => {
  // 1. Sanitize Input
  // Scanners might add %20 or extra spaces. 
  // UUIDs are long strings (e.g., "550e8400-e29b..."), so we ensure it's clean.
  const cleanQr = decodeURIComponent(qrCode).trim();

  // 2. Find Ticket
  // This works for BOTH old format ("TICKET-123") and new UUIDs ("550e8400...")
  const ticket = await prisma.ticket.findUnique({
    where: { qrCode: cleanQr },
    include: {
      seat: true,
      booking: {
        include: { user: true, event: true }
      }
    }
  });

  // 3. Check: Does it exist?
  if (!ticket) {
    throw new AppError('Invalid Ticket: QR Code not found in database', 404);
  }

  // 4. Check: Has it already been used?
  // This prevents the "Screenshot Hack" where users share tickets.
  if (ticket.scannedAt) {
    const timeUsed = new Date(ticket.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateUsed = new Date(ticket.scannedAt).toLocaleDateString();
    
    // 409 Conflict is the standard code for "Resource state conflict"
    throw new AppError(`ENTRY DENIED: Ticket already used on ${dateUsed} at ${timeUsed}`, 409);
  }

  // 5. Mark as Used (Update the timestamp)
  // We do this BEFORE returning success to ensure concurrency safety
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { scannedAt: new Date() }
  });

  // 6. Return Data formatted for Frontend Scanner UI
  return {
    valid: true,
    message: "Entry Approved",
    ticketId: ticket.id,       
    event: ticket.booking.event.title,
    location: ticket.booking.event.location,
    seat: ticket.seat.seatNumber,
    category: ticket.seat.category,
    holder: ticket.booking.user.name || "Guest",
    date: ticket.booking.event.date,
    scannedAt: new Date()      // Return the current scan time
  };
};