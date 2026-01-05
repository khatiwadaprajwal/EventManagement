import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

const PaymentSuccess = () => {
  const queryClient = useQueryClient();

  // Clear cache so My Bookings updates immediately
  useEffect(() => {
    queryClient.invalidateQueries(["my-bookings"]);
  }, [queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md text-center shadow-xl border-green-200">
        <CardHeader className="flex flex-col items-center space-y-4 pt-10">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="h1 text-green-700">Payment Successful!</h1>
          <p className="p1">
            Your booking has been confirmed. Your tickets are ready.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-slate-100 p-4 rounded-lg text-sm text-muted-foreground">
             Please check your email for the receipt or view your tickets in the dashboard.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pb-10">
          <Button asChild className="w-full" size="lg">
            <Link to="/bookings">
              View My Tickets <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;