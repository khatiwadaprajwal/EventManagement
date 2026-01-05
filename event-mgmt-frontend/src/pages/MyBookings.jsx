import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Ticket, CreditCard, Calendar, ChevronDown } from "lucide-react";
import { bookingAPI } from "@/api/bookings"; 
import { useInitiatePayment } from "@/hooks/usePayment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TicketModal from "@/components/TicketModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MyBookings = () => {
  // 1. Fetch User's Bookings
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingAPI.getMyBookings,
  });

  // 2. Payment Hook
  const { mutate: payNow, isPending: isPaying } = useInitiatePayment();
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  // 🛠️ Updated: Accepts gateway dynamically
  const handlePay = (bookingId, gateway) => {
    payNow({ bookingId, gateway });
  };

  // Robust Data Extraction
  const bookingsData = data?.data || {};
  const bookings = Array.isArray(bookingsData) 
    ? bookingsData 
    : (bookingsData.bookings || []);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (isError) return <div className="text-center p-20 text-red-500">Failed to load bookings.</div>;

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-slate-50/50">
      <h1 className="h1 mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border shadow-sm">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="h2 text-muted-foreground">No bookings found</h2>
          <p className="p1">Go exploring and book your first event!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="flex flex-col border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold truncate">
                      {booking.event?.title || "Event Name"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar className="mr-1 h-3 w-3" />
                      {booking.event?.date ? format(new Date(booking.event.date), "PPP") : "TBA"}
                    </p>
                  </div>
                  <Badge variant={booking.status === "COMPLETED" || booking.status === "CONFIRMED" ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-grow space-y-4 py-4">
                {/* Seats List */}
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Seats</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.tickets?.map((ticket) => (
                      <Badge key={ticket.id} variant="outline" className="bg-slate-50">
                        {ticket.seatNumber}
                      </Badge>
                    )) || <span className="text-sm text-muted-foreground">Processing seats...</span>}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center font-medium">
                  <span>Total Amount</span>
                  <span>NPR {booking.totalAmount}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                {/* Logic: If Pending, Show Payment Options. Else Show Ticket */}
                {booking.status === "PENDING" ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full" disabled={isPaying}>
                        {isPaying ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CreditCard className="mr-2 h-4 w-4" />
                        )}
                        Pay Now <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem 
                        onClick={() => handlePay(booking.id, "KHALTI")}
                        className="cursor-pointer text-purple-700 font-medium"
                      >
                        Pay with Khalti
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handlePay(booking.id, "PAYPAL")}
                        className="cursor-pointer text-blue-600 font-medium"
                      >
                        Pay with PayPal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedBookingId(booking.id)} lassName="w-full border-green-600 text-green-600 hover:bg-green-50">
                    <Ticket className="mr-2 h-4 w-4" />
                    View Ticket
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
        {/* Ticket Modal */}
        <TicketModal 
        bookingId={selectedBookingId} 
        isOpen={!!selectedBookingId} 
        onClose={() => setSelectedBookingId(null)} 
      />
    </div>
  );
};

export default MyBookings;