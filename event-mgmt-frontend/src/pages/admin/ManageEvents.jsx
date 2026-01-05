import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Eye, 
  Pencil, // Changed from Edit to Pencil for better icon
  TrendingUp,
  Ticket,
  Search,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  ExternalLink
} from "lucide-react";
import { useEvents, useDeleteEvent } from "@/hooks/useEvents"; 

const ManageEvents = () => {
  // --- STATE ---
  const [search, setSearch] = useState(""); 
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [page, setPage] = useState(1);
  const LIMIT = 8; 

  // Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Data
  const { data, isLoading, isError } = useEvents({ 
    search: debouncedSearch, 
    page: page, 
    limit: LIMIT,
    sort: '-createdAt'
  }); 
  
  const { mutate: deleteEvent } = useDeleteEvent();

  // Extract Data
  const events = data?.data?.events || [];
  const meta = data?.data?.meta || { total: 0, page: 1, limit: LIMIT };
  
  const totalPages = Math.ceil(meta.total / LIMIT);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleDelete = (id) => {
    if (confirm("Are you sure? This will cancel all bookings associated with this event.")) {
      deleteEvent(id);
    }
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Manage Events</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Oversee your concerts, track revenue, and manage schedules.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9 bg-white shadow-sm border-slate-200 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Button asChild className="shadow-md bg-primary hover:bg-primary/90 transition-all">
            <Link to="/admin/create-event">
              <Plus className="mr-2 h-4 w-4" /> Create New
            </Link>
          </Button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p>Syncing with database...</p>
          </div>
        ) : isError ? (
          <div className="p-20 text-center text-red-500 bg-red-50">
            <p>Failed to load events. Please try refreshing.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-100">
                <TableRow>
                  <TableHead className="w-[300px] font-semibold text-slate-700">Event Details</TableHead>
                  <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                  <TableHead className="font-semibold text-slate-700">Sales</TableHead>
                  <TableHead className="font-semibold text-slate-700">Revenue</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Filter className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">No events found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => {
                    const ticketsSold = event.bookings?.length || 0;
                    const revenue = event.bookings?.reduce((sum, b) => sum + Number(b.totalAmount), 0) || 0;
                    const isUpcoming = new Date(event.date) > new Date();

                    return (
                      <TableRow key={event.id} className="group hover:bg-slate-50/50 transition-colors">
                        
                        {/* 1. Info */}
                        <TableCell>
                          <div className="flex items-start gap-4 py-2">
                            <div className="h-14 w-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border shadow-sm">
                              <img src={event.bannerUrl} alt="banner" className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col gap-1">
                               <span className="font-bold text-slate-900 line-clamp-1">{event.title}</span>
                               <span className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]">{event.description}</span>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* 2. Schedule */}
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {format(new Date(event.date), "MMM d, yyyy")}
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-xs">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate max-w-[120px]">{event.location}</span>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* 3. Sales */}
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                            <Ticket className="h-3 w-3 mr-1" />
                            {ticketsSold}
                          </Badge>
                        </TableCell>

                        {/* 4. Revenue */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                            <TrendingUp className="h-4 w-4" />
                            {formatNPR(revenue)}
                          </div>
                        </TableCell>

                        {/* 5. Status */}
                        <TableCell>
                          {isUpcoming ? (
                            <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none">Upcoming</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-200">Past</Badge>
                          )}
                        </TableCell>

                        {/* 6. ACTIONS (Redesigned) */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Button */}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50" asChild title="View Public Page">
                              <Link to={`/events/${event.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>

                            {/* Edit Button */}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-orange-600 hover:bg-orange-50" asChild title="Edit Details">
                              <Link to={`/admin/edit-event/${event.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>

                            {/* Delete Button */}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(event.id)}
                              title="Delete Event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* --- PAGINATION --- */}
            {meta.total > 0 && (
              <div className="flex items-center justify-between px-4 py-4 border-t bg-slate-50/50">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{(page - 1) * LIMIT + 1}</strong> - <strong>{Math.min(page * LIMIT, meta.total)}</strong> of <strong>{meta.total}</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasNextPage}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageEvents;