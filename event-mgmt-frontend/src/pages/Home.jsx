import { useEvents } from "@/hooks/useEvents";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Home = () => {
  const { data, isLoading, isError } = useEvents();

  // 🛠️ FIX: Extract based on your exact JSON structure
  // API returns: { success: true, data: { events: [...] } }
  const events = data?.data?.events || [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <h1 className="h1 text-4xl md:text-5xl lg:text-6xl text-white">
            Discover Amazing Events
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Book tickets for the hottest concerts, workshops, and meetups in town.
          </p>
          
          <div className="max-w-md mx-auto relative mt-8">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-10 h-12 rounded-full bg-white text-black border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="h2 text-2xl">Upcoming Events</h2>
          <Button variant="outline">View All</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((n) => (
               <div key={n} className="h-[350px] bg-slate-200 rounded-xl animate-pulse" />
             ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-red-500">
            Failed to load events.
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;