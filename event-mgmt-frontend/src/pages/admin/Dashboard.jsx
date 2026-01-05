import { Link } from "react-router-dom";
import { Plus, QrCode, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage events and verify tickets.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Create Event */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Event</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Create</div>
            <p className="text-xs text-muted-foreground mb-4">
              Add a new concert or event with seat configurations.
            </p>
            <Button asChild className="w-full">
              <Link to="/admin/create-event">Create Event</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card 2: Verify Tickets (Coming Soon) */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operations</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">Verify Tickets</div>
            <p className="text-xs text-muted-foreground mb-4">
              Scan QR codes to validate attendee entry.
            </p>
            {/* We will build this page next */}
            <Button variant="outline" asChild className="w-full">
              <Link to="/admin/verify">Open Scanner</Link>
            </Button>
          </CardContent>
        </Card>

         {/* Card 3: Manage Events (Placeholder) */}
         <Card className="hover:shadow-md transition-shadow opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Management</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">My Events</div>
            <p className="text-xs text-muted-foreground mb-4">
              Edit or cancel existing events.
            </p>
            <Button variant="secondary" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminDashboard;