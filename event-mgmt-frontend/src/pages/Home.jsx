import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; 
import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Filter,
  X,
} from "lucide-react";

// --- SUB-COMPONENT: HANDLES GRID STATES ---
const EventGrid = ({ isLoading, isError, events, clearFilters }) => {
  // 1. Loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="space-y-3">
            <div className="h-[280px] w-full bg-slate-200 rounded-2xl animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Error
  if (isError) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-red-100">
        <p className="text-red-500 font-medium">Failed to load events.</p>
      </div>
    );
  }

  // 3. Empty
  if (events.length === 0) {
    return (
      <div className="bg-white py-20 rounded-2xl text-center border border-dashed border-slate-200 shadow-sm">
        <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
          <Search className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No events found</h3>
        <p className="text-slate-500 mt-1">We couldn't find anything matching your search/filters.</p>
        <Button variant="link" onClick={clearFilters} className="mt-2 text-primary font-semibold">
          Clear All Filters
        </Button>
      </div>
    );
  }

  // 4. Success
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <div key={event.id} className="transform transition-all duration-300 hover:-translate-y-1">
           <EventCard event={event} /> 
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  // --- URL PARAMS SETUP ---
  const [searchParams, setSearchParams] = useSearchParams();
  const LIMIT = 9;

  // Derive "Active" state from URL
  const page = parseInt(searchParams.get("page") || "1");
  const activeSearch = searchParams.get("search") || "";
  const activeLocation = searchParams.get("location") || "";
  const activeDate = searchParams.get("date") || "";

  // --- LOCAL STATE (For Inputs before they are applied) ---
  const [searchInput, setSearchInput] = useState(activeSearch);
  const [filterLocation, setFilterLocation] = useState(activeLocation);
  const [filterDate, setFilterDate] = useState(activeDate);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Control Popover

  // --- 1. HANDLE SEARCH (Debounce to URL) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update URL if the value actually changed
      if (searchInput !== activeSearch) {
        setSearchParams(prev => {
          if (searchInput) prev.set("search", searchInput);
          else prev.delete("search");
          prev.set("page", "1"); // Reset page on search
          return prev;
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, setSearchParams, activeSearch]);

  // --- 2. HANDLE FILTERS (Apply Button) ---
  const handleApplyFilters = () => {
    setSearchParams(prev => {
      if (filterLocation) prev.set("location", filterLocation);
      else prev.delete("location");

      if (filterDate) prev.set("date", filterDate);
      else prev.delete("date");

      prev.set("page", "1"); 
      return prev;
    });
    setIsFilterOpen(false); 
  };

  const clearFilters = () => {
    setFilterLocation("");
    setFilterDate("");
    setSearchParams(prev => {
      prev.delete("location");
      prev.delete("date");
      prev.set("page", "1");
      return prev;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set("page", newPage.toString());
      return prev;
    });
    
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const { data, isLoading, isError } = useEvents({ 
    search: activeSearch, 
    page, 
    limit: LIMIT,
    sort: '-date',
    ...(activeLocation && { location: activeLocation }),
    ...(activeDate && { date: activeDate }),
  });

  const events = data?.data?.events || [];
  const meta = data?.data?.meta || { total: 0, page: 1, limit: LIMIT };
  
  const totalPages = Math.ceil(meta.total / LIMIT);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;


  const activeFilterCount = (activeLocation ? 1 : 0) + (activeDate ? 1 : 0);

  
  const onPopoverOpenChange = (open) => {
    if (open) {
      setFilterLocation(activeLocation);
      setFilterDate(activeDate);
    }
    setIsFilterOpen(open);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/20">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-[#0F172A] pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-medium text-slate-300 shadow-sm">
              <Sparkles className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span>Discover the best local experiences</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Your Next Adventure <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
                Starts Here.
              </span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-normal">
              Secure your spot at the hottest concerts and events in Kathmandu.
            </p>
            
            <div className="w-full max-w-lg relative mt-6 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-500" />
              <div className="relative flex items-center bg-white rounded-full shadow-xl p-1.5 pl-5 transition-transform group-hover:scale-[1.01]">
                <Search className="h-4 w-4 text-slate-400" />
                <Input 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search events..." 
                  className="flex-grow border-0 shadow-none focus-visible:ring-0 text-base h-10 bg-transparent placeholder:text-slate-400 text-slate-800"
                />
                <Button size="sm" className="rounded-full px-6 h-10 font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-12 relative z-20 pb-20">
        

        <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 p-4 rounded-xl shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                 <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-none">
                  {activeSearch ? `Results for "${activeSearch}"` : "Upcoming Events"}
                </h2>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  {meta.total} experiences found
                </p>
              </div>
           </div>

           
           <Popover open={isFilterOpen} onOpenChange={onPopoverOpenChange}>
             <PopoverTrigger asChild>
               <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50 h-9 relative">
                 <Filter className="mr-2 h-3.5 w-3.5" /> 
                 Filter
                 {activeFilterCount > 0 && (
                   <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                     {activeFilterCount}
                   </span>
                 )}
               </Button>
             </PopoverTrigger>
             <PopoverContent className="w-80 p-4" align="end">
               <div className="grid gap-4">
                 <div className="space-y-2">
                   <h4 className="font-medium leading-none">Refine Results</h4>
                   <p className="text-sm text-muted-foreground">
                     Filter events by location or date.
                   </p>
                 </div>
                 <div className="grid gap-2">
                   <div className="grid grid-cols-3 items-center gap-4">
                     <Label htmlFor="location">Location</Label>
                     <Input
                       id="location"
                       placeholder="e.g. Kathmandu"
                       className="col-span-2 h-8"
                       value={filterLocation}
                       onChange={(e) => setFilterLocation(e.target.value)}
                     />
                   </div>
                   <div className="grid grid-cols-3 items-center gap-4">
                     <Label htmlFor="date">Date</Label>
                     <Input
                       id="date"
                       type="date"
                       className="col-span-2 h-8 block"
                       value={filterDate}
                       onChange={(e) => setFilterDate(e.target.value)}
                     />
                   </div>
                 </div>
                 <div className="flex justify-between items-center pt-2">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2">
                      <X className="mr-1 h-3 w-3" /> Reset
                    </Button>
                    <Button size="sm" onClick={handleApplyFilters} className="h-8">Apply Filters</Button>
                 </div>
               </div>
             </PopoverContent>
           </Popover>
        </div>

        {/* --- GRID (Refactored to use Sub-Component) --- */}
        <EventGrid 
          isLoading={isLoading} 
          isError={isError} 
          events={events} 
          clearFilters={clearFilters} 
        />

        {/* --- PAGINATION --- */}
        {meta.total > LIMIT && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <Button
              variant="secondary"
              className="bg-white shadow-sm border border-slate-200 hover:bg-slate-50"
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPrevPage}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            <span className="text-sm font-semibold text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="secondary"
              className="bg-white shadow-sm border border-slate-200 hover:bg-slate-50"
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNextPage}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

      </section>
    </div>
  );
};

export default Home;