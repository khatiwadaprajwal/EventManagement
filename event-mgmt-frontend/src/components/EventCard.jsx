import { Link } from "react-router-dom";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const EventCard = ({ event }) => {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full bg-muted">
        {/* 🛠️ FIX: Use event.bannerUrl */}
        <img 
          src={event.bannerUrl || "https://placehold.co/600x400?text=No+Image"} 
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 right-2">
           <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur">
             Upcoming
           </Badge>
        </div>
      </div>

      <CardHeader className="p-4 pb-0">
        <h3 className="text-xl font-bold tracking-tight line-clamp-1">{event.title}</h3>
      </CardHeader>

      <CardContent className="p-4 flex-grow space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          <span>
            {/* Handle valid date */}
            {event.date ? format(new Date(event.date), "PPP") : "TBA"}
          </span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-2 h-4 w-4" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {/* Handle null description */}
          {event.description || "No description available."}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full group">
          <Link to={`/events/${event.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;