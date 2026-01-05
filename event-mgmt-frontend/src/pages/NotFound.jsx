import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <Ghost className="h-16 w-16 text-slate-400" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-muted-foreground mb-6">
        Page not found
      </h2>
      <p className="text-slate-500 max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild size="lg">
        <Link to="/">Go back home</Link>
      </Button>
    </div>
  );
};

export default NotFound;