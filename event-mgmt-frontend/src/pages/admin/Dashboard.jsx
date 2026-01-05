import { Link } from "react-router-dom";
import { 
  Plus, 
  QrCode, 
  Calendar, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  ArrowRight, 
  Zap,
  Ticket,
  Users
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const AdminDashboard = () => {
  // 1. Fetch Data (Limit 100 to get a good overview for stats)
  const { data, isLoading } = useEvents({ limit: 100 });
  const events = data?.data?.events || [];

  // --- REAL-TIME CALCULATIONS ---
  
  // A. Total Events
  const totalEvents = events.length;

  // B. Active Events (Future Date)
  const activeEvents = events.filter(e => new Date(e.date) > new Date()).length;

  // C. Total Revenue (Sum of all CONFIRMED bookings across all events)
  const totalRevenue = events.reduce((acc, event) => {
    // Backend returns event.bookings thanks to our service update
    const eventRevenue = event.bookings?.reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0;
    return acc + eventRevenue;
  }, 0);

  // D. Total Tickets Sold
  const totalTicketsSold = events.reduce((acc, event) => {
    return acc + (event.bookings?.length || 0);
  }, 0);

  // Format Currency (NPR)
  const formatNPR = (amount) => {
    return new Intl.NumberFormat('en-NP', { 
      style: 'currency', 
      currency: 'NPR', 
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen bg-slate-50/50">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Overview</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Real-time insights and management command center.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-full border shadow-sm px-5">
           <div className="relative">
             <div className="h-3 w-3 rounded-full bg-green-500 animate-ping absolute opacity-75" />
             <div className="h-3 w-3 rounded-full bg-green-500 relative" />
           </div>
           <span className="text-sm font-medium text-slate-700">System Live</span>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* 1. Revenue Card */}
        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
          <div className="absolute -top-4 -right-4 p-4 opacity-10">
            <DollarSign className="h-32 w-32 text-emerald-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-24 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black text-emerald-700">{formatNPR(totalRevenue)}</div>
            )}
            <p className="text-xs text-emerald-600/80 mt-2 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> Lifetime Earnings
            </p>
          </CardContent>
        </Card>

        {/* 2. Tickets Sold */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
          <div className="absolute -top-4 -right-4 p-4 opacity-10">
            <Ticket className="h-32 w-32 text-blue-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tickets Sold</CardTitle>
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black text-slate-800">{totalTicketsSold}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <Users className="h-3 w-3 mr-1" /> Confirmed Bookings
            </p>
          </CardContent>
        </Card>

        {/* 3. Active Events */}
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
          <div className="absolute -top-4 -right-4 p-4 opacity-10">
            <Zap className="h-32 w-32 text-purple-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Now</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-10 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black text-slate-800">{activeEvents}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <Activity className="h-3 w-3 mr-1 text-purple-500" /> Upcoming Shows
            </p>
          </CardContent>
        </Card>

        {/* 4. Total Database */}
        <Card className="relative overflow-hidden border-l-4 border-l-slate-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-slate-50/30">
          <div className="absolute -top-4 -right-4 p-4 opacity-10">
            <Calendar className="h-32 w-32 text-slate-600" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-8 w-10 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-black text-slate-800">{totalEvents}</div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              All time records
            </p>
          </CardContent>
        </Card>

      </div>

      <Separator className="my-8" />

      {/* --- QUICK ACTIONS --- */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          Management <span className="text-primary">Actions</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create */}
        <Card className="group relative overflow-hidden border hover:border-primary/50 transition-all duration-300 cursor-pointer bg-white" onClick={() => window.location.href='/admin/create-event'}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
               <Plus className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Create Event</CardTitle>
            <CardDescription>Launch a new concert or show.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="p-0 text-primary group-hover:translate-x-2 transition-transform font-semibold">
              Start Creation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Verify */}
        <Card className="group relative overflow-hidden border hover:border-orange-500/50 transition-all duration-300 cursor-pointer bg-white" onClick={() => window.location.href='/admin/verify'}>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
               <QrCode className="h-5 w-5 text-orange-600" />
            </div>
            <CardTitle className="text-lg">Verify Tickets</CardTitle>
            <CardDescription>Scan attendee QR codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="p-0 text-orange-600 group-hover:translate-x-2 transition-transform font-semibold">
              Open Scanner <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Manage */}
        <Card className="group relative overflow-hidden border hover:border-slate-500/50 transition-all duration-300 cursor-pointer bg-white" onClick={() => window.location.href='/admin/events'}>
           <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
               <Calendar className="h-5 w-5 text-slate-700" />
            </div>
            <CardTitle className="text-lg">Manage Events</CardTitle>
            <CardDescription>Edit details or remove events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="p-0 text-slate-600 group-hover:translate-x-2 transition-transform font-semibold">
              Go to List <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default AdminDashboard;