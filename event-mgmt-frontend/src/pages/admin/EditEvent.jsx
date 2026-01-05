import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEventDetails, useUpdateEvent } from "@/hooks/useEvents"; // 👈 Strict Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

// Simplified Schema
const editEventSchema = z.object({
  title: z.string().min(5, "Title is required"),
  description: z.string().min(10, "Description is required"),
  location: z.string().min(3, "Location is required"),
  date: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Event date must be in the future",
  }),
});

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 🛠️ FIX 1: Variable Naming
  const { data, isLoading } = useEventDetails(id);
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const [banner, setBanner] = useState(null);
  const [currentBanner, setCurrentBanner] = useState("");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(editEventSchema),
  });

  // Pre-fill Form
  useEffect(() => {
    // 🛠️ FIX 2: Use 'data' variable (not eventData)
    const event = data?.data?.event || data?.data || {}; 

    if (event.title) {
      setValue("title", event.title);
      setValue("description", event.description);
      setValue("location", event.location);
      
      const dateStr = event.date ? new Date(event.date).toISOString().split("T")[0] : "";
      setValue("date", dateStr);
      
      setCurrentBanner(event.bannerUrl);
    }
  }, [data, setValue]); // 🛠️ FIX 3: Dependency array matches variable

  const onSubmit = (values) => {
    const formData = new FormData();
    
    // Append Text Fields
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("location", values.location);
    formData.append("date", values.date);

    // Only append file if user selected a new one
    if (banner) {
      formData.append("banner", banner);
    }

    updateEvent({ id, formData });
  };

  // 🛠️ FIX 4: Use 'isLoading' (not isLoadingData)
  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate("/admin/events")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="h2">Edit Event</CardTitle>
          <CardDescription className="p1">
            Update event details. Seat configurations cannot be changed once created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input {...register("title")} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...register("date")} />
                  {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...register("location")} />
                {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...register("description")} rows={5} />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div className="flex items-center gap-4">
                {/* Preview Current or New */}
                <div className="h-20 w-32 bg-slate-100 rounded overflow-hidden border">
                   <img 
                      src={banner ? URL.createObjectURL(banner) : currentBanner} 
                      alt="Preview" 
                      className="h-full w-full object-cover" 
                   />
                </div>
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setBanner(e.target.files[0])} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current banner.</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Update Event"}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditEvent;