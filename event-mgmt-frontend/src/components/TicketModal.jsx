import React from "react";
import QRCode from "react-qr-code";
import { format } from "date-fns";
import { Loader2, Calendar, MapPin, User, X, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

const TicketModal = ({ booking, isOpen, onClose }) => {
  const { user } = useAuth(); 

  if (!booking) return null;

  const event = booking.event || {};
  const tickets = booking.tickets || [];
  
  
  const qrSecretValue = tickets.length > 0 
    ? tickets[0].qrCode 
    : `TICKET-${booking.id}`; 

 
  const displayId = tickets.length > 0 
    ? `REF: #${booking.id}-${tickets[0].id}` 
    : `REF: #${booking.id}`;

  const seats = tickets.length > 0 
    ? tickets.map(t => t.seat) 
    : (booking.seats || []);

  const attendeeName = booking.user?.name || user?.name || "Guest";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-50 p-0 overflow-hidden gap-0 border-0 shadow-2xl">
        
        {/* Header Image */}
        <div className="relative h-40 w-full bg-slate-900">
          <img 
            src={event.bannerUrl || "/placeholder.jpg"} 
            alt="Event" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
             <DialogTitle className="text-2xl font-bold drop-shadow-md">
               {event.title || "Your E-Ticket"}
             </DialogTitle>
             <DialogDescription className="text-slate-200 text-xs mt-1 flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
               <ShieldCheck className="h-3 w-3 text-green-400" />
               Official E-Ticket
             </DialogDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 text-white hover:bg-white/20 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          

          <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4 relative overflow-hidden">
           
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200"></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200"></div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-slate-700">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {event.date ? format(new Date(event.date), "PPP") : "Date TBA"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.date ? format(new Date(event.date), "p") : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm font-medium mt-0.5">{event.location}</span>
              </div>
            </div>

            <Separator className="border-dashed my-2" />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Attendee</span>
                <div className="flex items-center gap-2 font-bold text-sm mt-1 text-slate-800 truncate">
                    <User className="h-4 w-4 text-slate-400" /> {attendeeName}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Seats</span>
                <div className="font-bold text-sm mt-1 text-primary truncate">
                  {seats.length > 0 
                    ? seats.map(s => s.seatNumber).join(", ") 
                    : "General Admission"}
                </div>
              </div>
            </div>
          </div>

         
          <div className="flex flex-col items-center justify-center">
            <div className="p-3 bg-white border-4 border-slate-900 rounded-2xl shadow-lg relative">
               
              <QRCode 
                value={qrSecretValue} 
                size={180} 
                level="H" 
                viewBox={`0 0 256 256`}
              />
            </div>
           
            <p className="text-[10px] text-muted-foreground mt-4 font-mono tracking-widest uppercase">
              {displayId}
            </p>
          </div>
          
          <div className="text-center">
            <Button className="w-full" variant="outline" onClick={onClose}>
              Close Ticket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketModal;