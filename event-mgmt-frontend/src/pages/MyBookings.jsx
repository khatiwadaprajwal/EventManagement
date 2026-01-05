import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Loader2, 
  Ticket, 
  CreditCard, 
  Calendar, 
  ChevronDown, 
  MapPin, 
  TriangleAlert,
  Clock
} from "lucide-react";
import { bookingAPI } from "@/api/bookings"; 
import { useInitiatePayment } from "@/hooks/usePayment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TicketModal from "@/components/TicketModal";
import BookingTimer from "@/components/BookingTimer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MyBookings = () => {
  // 1️⃣ Fetch User's Bookings
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingAPI.getMyBookings,
  });

  const { mutate: payNow, isPending: isPaying } = useInitiatePayment();
  
  // 2️⃣ FIX: State stores the OBJECT, not the ID
  const [selectedBooking, setSelectedBooking] = useState(null);

  const bookingsData = data?.data || {};
  const bookings = Array.isArray(bookingsData) 
    ? bookingsData 
    : (bookingsData.bookings || []);

  const handlePay = (bookingId, gateway) => {
    payNow({ bookingId, gateway });
  };

  const hasPendingBookings = bookings.some(b => b.status === "PENDING");

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (isError) return <div className="text-center p-20 text-red-500">Failed to load bookings.</div>;

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-slate-50/50">
      
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-muted-foreground">Manage your tickets and track payment status.</p>
      </div>

      {hasPendingBookings && (
        <Alert variant="warning" className="mb-8 border-orange-200 bg-orange-50 text-orange-800">
          <TriangleAlert className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 font-semibold">Action Required</AlertTitle>
          <AlertDescription>
            You have pending bookings. Please complete payment within <strong>15 minutes</strong> to secure your seats. 
            Unpaid bookings are automatically released.
          </AlertDescription>
        </Alert>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-200 shadow-sm">
          <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
            <Ticket className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No bookings found</h2>
          <p className="text-sm text-slate-500 mb-6">You haven't booked any events yet.</p>
          <Button asChild>
            <a href="/">Browse Events</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {bookings.map((booking) => {
            const isPending = booking.status === "PENDING";
            const isCancelled = booking.status === "CANCELLED" || booking.status === "EXPIRED";
            const event = booking.event || {};
            
            // Handle legacy (seats) vs new (tickets) structure
            const listItems = booking.tickets || booking.seats || [];

            return (
              <Card
                key={booking.id}
                className={`
                  flex flex-col transition-all duration-200
                  ${isPending ? "border-l-4 border-l-orange-500 shadow-md ring-1 ring-orange-100" : ""}
                  ${isCancelled ? "opacity-75 grayscale bg-slate-50 border-slate-200" : "hover:shadow-md border-l-4 border-l-green-500"}
                `}
              >
                {/* Header */}
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="overflow-hidden">
                      <CardTitle className="text-lg font-bold truncate leading-tight">
                        {event.title || "Event Name"}
                      </CardTitle>
                      <div className="flex flex-col gap-1 mt-2">
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="mr-1.5 h-3.5 w-3.5" />
                          {event.date ? format(new Date(event.date), "PPP") : "TBA"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="mr-1.5 h-3.5 w-3.5" />
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={isPending ? "outline" : isCancelled ? "secondary" : "default"}
                      className={`
                        shrink-0 font-medium
                        ${isPending ? "border-orange-500 text-orange-600 bg-orange-50" : ""}
                        ${!isPending && !isCancelled ? "bg-green-600 hover:bg-green-700" : ""}
                      `}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>

                <Separator className="opacity-50" />


                <CardContent className="flex-grow space-y-4 py-4">
               
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Seats Reserved</p>
                      <p className="text-xs text-muted-foreground">{listItems.length} selected</p>
                    </div>
                    
                    {listItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {listItems.map((item, idx) => {
                          const seatNumber = item.seat?.seatNumber || item.seatNumber || "Unknown";
                          return (
                            <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 font-mono text-xs">
                              {seatNumber}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No seats info</span>
                    )}
                  </div>

                  <div className="flex justify-between items-end pt-2">
                    <span className="text-sm text-muted-foreground font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-slate-900">NPR {booking.totalAmount}</span>
                  </div>
                </CardContent>

        
                <CardFooter className="flex flex-col gap-3 pt-0 bg-slate-50/50 p-4 border-t">
                
                  {isPending && booking.expiresAt && (
                    <div className="w-full flex items-center justify-between text-xs bg-orange-100/50 text-orange-800 p-2 rounded-md border border-orange-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-semibold">Expires in:</span>
                      </div>
                      <BookingTimer expiresAt={booking.expiresAt} />
                    </div>
                  )}

                  {isPending ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 transition-all shadow-sm" disabled={isPaying}>
                          {isPaying ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CreditCard className="mr-2 h-4 w-4" />
                          )}
                          Pay Now <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                        <DropdownMenuItem
                          onClick={() => handlePay(booking.id, "KHALTI")}
                          className="cursor-pointer font-medium py-2.5 focus:bg-purple-50 text-purple-700"
                        >
                          Pay with Khalti
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePay(booking.id, "PAYPAL")}
                          className="cursor-pointer font-medium py-2.5 focus:bg-blue-50 text-blue-700"
                        >
                          Pay with PayPal
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : isCancelled ? (
                    <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
                      Booking Cancelled
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      // 3️⃣ FIX: Pass the whole object here
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800 shadow-sm"
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      View Ticket
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}


      <TicketModal
        booking={selectedBooking} 
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
};

export default MyBookings;