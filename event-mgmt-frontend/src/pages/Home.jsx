import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; 

const Home = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Event Manager
          </CardTitle>
          <p className="text-center text-muted-foreground">
            System Operational
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Enter your email..." />
          <Button 
            className="w-full" 
            onClick={() => toast.success("System works perfectly!")}
          >
            Test System
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;