import QRCode from "react-qr-code";
import { format } from "date-fns";
import { Loader2, Download, Calendar, MapPin, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBookingDetails } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";
const TicketModal = ({ bookingId, isOpen, onClose }) => {
  // 1. Fetch Data
  const { data, isLoading, isError } = useBookingDetails(bookingId);




const { user } = useAuth(); 
const booking = data?.data?.booking || {};
const attendeeName = booking.user?.name || user?.name || "Guest";
  const event = booking?.event || {};
  const seats = booking?.seats || [];
  
  // Construct QR String (Must match what Admin Scanner expects)
  // Format: TICKET-{bookingId}-{seatId}-{uniqueCode}
  // For simplicity, we assume the backend sends a specific "qrString" or we use the Booking ID
  const qrValue = booking?.ticketCode || `TICKET-${booking.id}`; 

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-50">
        <DialogHeader>
          <DialogTitle className="h2 text-center">Your E-Ticket</DialogTitle>
          <DialogDescription className="text-center p1">
            Show this QR code at the entrance.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-10">
            Failed to load ticket details.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Ticket Card UI */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden relative">
              {/* Event Banner (Small) */}
              <div className="h-32 w-full bg-slate-900">
                <img 
                  src={event.bannerUrl} 
                  alt="Event" 
                  className="w-full h-full object-cover opacity-80"
                />
              </div>

              <div className="p-6 space-y-4">
                {/* Event Info */}
                <div>
                  <h3 className="h2 text-lg line-clamp-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date ? format(new Date(event.date), "PPP") : "Date TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <Separator className="border-dashed" />

                {/* Seat & User Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold">Attendee</span>
                    <div className="flex items-center gap-1 font-medium text-sm">
                       <User className="h-3 w-3" /> {attendeeName }
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase font-bold">Seats</span>
                    <div className="font-medium text-sm">
                      {seats.map(s => s.seatNumber).join(", ")}
                    </div>
                  </div>
                </div>

                <Separator className="border-dashed" />

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <div className="p-2 border-2 border-slate-900 rounded-lg">
                    <QRCode 
                      value={qrValue} 
                      size={120} 
                      level="H" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    {qrValue}
                  </p>
                </div>
              </div>
            </div>

            <Button className="w-full" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;