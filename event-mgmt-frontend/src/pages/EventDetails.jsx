import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Calendar, ImageIcon } from "lucide-react"; // Added ImageIcon
import { useEventDetails, useCreateBooking } from "@/hooks/useBookings";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const { data, isLoading, error } = useEventDetails(id);
  const { mutate: bookSeats, isPending } = useCreateBooking();
  
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  // Data Extraction
  const eventData = data?.data || {};
  const event = eventData.event || {};
  const seats = event.seats || []; 
  const galleryImages = event.images || []; // 👈 Extract images array

  const toggleSeat = (seatId) => {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seatId));
    } else {
      setSelectedSeatIds(prev => [...prev, seatId]);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error("Please login to book tickets");
      navigate("/login");
      return;
    }
    
    bookSeats({
      eventId: parseInt(id),
      seatIds: selectedSeatIds
    }, {
      onSuccess: (response) => {
        const paymentUrl = response?.data?.paymentUrl;
        if (paymentUrl) {
           window.location.href = paymentUrl;
        } else {
           navigate("/bookings"); 
        }
      }
    });
  };

  if (isLoading) return <div className="text-center py-20 animate-pulse">Loading Event Details...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Event not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Banner Section */}
      <div className="relative w-full h-[400px] bg-slate-900">
        <img 
          src={event.bannerUrl || "https://placehold.co/1200x400"} 
          alt={event.title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto">
           <Badge className="mb-4">Upcoming</Badge>
           <h1 className="h1 text-white text-4xl md:text-6xl drop-shadow-lg">{event.title}</h1>
           <div className="flex items-center gap-6 mt-4 text-white/90">
             <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-lg">
                  {event.date ? format(new Date(event.date), "PPPP") : "TBA"}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{event.location}</span>
             </div>
           </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Info, Gallery & Seat Grid */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Description */}
          <section>
            <h2 className="h2 mb-4">About this Event</h2>
            <p className="p1 leading-relaxed">{event.description || "No description provided."}</p>
          </section>

          <Separator />

          {/* 👇 NEW: Gallery Section */}
          {galleryImages.length > 0 && (
            <>
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h2 className="h2">Gallery</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((imgUrl, index) => (
                    <div key={index} className="rounded-xl overflow-hidden shadow-sm border aspect-video group">
                      <img 
                        src={imgUrl} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Seat Selection */}
          <section>
            <h2 className="h2 mb-6">Select Your Seats</h2>
            {seats.length === 0 ? (
              <p className="p1 italic">No seats configuration available for this event.</p>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex gap-4 mb-6 text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-100 border" /> Available</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary" /> Selected</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-300 cursor-not-allowed" /> Booked</div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 justify-center">
                  {seats.map((seat) => {
                    const isBooked = seat.status === "BOOKED" || seat.status === "LOCKED";
                    const isSelected = selectedSeatIds.includes(seat.id);
                    
                    return (
                      <button
                        key={seat.id}
                        disabled={isBooked}
                        onClick={() => toggleSeat(seat.id)}
                        className={`
                          relative h-10 w-full rounded-md text-xs font-medium transition-all
                          flex items-center justify-center border
                          ${isBooked 
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed border-transparent" 
                            : isSelected 
                              ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-1" 
                              : "bg-white hover:border-primary hover:text-primary text-slate-600 border-slate-200"
                          }
                        `}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Booking Summary Card */}
        <div className="lg:col-span-1">
           <Card className="sticky top-24 shadow-lg border-t-4 border-t-primary">
             <CardHeader>
               <h2 className="h2 text-xl">Booking Summary</h2>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Price per Seat</span>
                 <span className="font-medium">NPR {seats[0]?.price || 0}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Seats Selected</span>
                 <span className="font-medium">{selectedSeatIds.length}</span>
               </div>
               <Separator />
               <div className="flex justify-between text-lg font-bold">
                 <span>Total</span>
                 <span>NPR {selectedSeatIds.length * (seats[0]?.price || 0)}</span>
               </div>
             </CardContent>
             <CardFooter>
               <Button 
                 className="w-full text-lg h-12" 
                 onClick={handleBooking}
                 disabled={selectedSeatIds.length === 0 || isPending}
               >
                 {isPending ? "Processing..." : isAuthenticated ? "Proceed to Payment" : "Login to Book"}
               </Button>
             </CardFooter>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;