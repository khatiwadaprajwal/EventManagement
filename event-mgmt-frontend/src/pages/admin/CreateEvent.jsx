import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useCreateEvent } from "@/hooks/useEvents"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";

// --- VALIDATION SCHEMA ---
const eventSchema = z.object({
  title: z.string().min(5, "Title is required"),
  description: z.string().min(10, "Description is required"),
  location: z.string().min(3, "Location is required"),
  date: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Event date must be in the future",
  }),
  // Seat Config Validation
  seatConfig: z.array(
    z.object({
      category: z.string().min(1, "Category name required"),
      count: z.coerce.number().min(1, "At least 1 seat"),
      price: z.coerce.number().min(0, "Price cannot be negative"),
    })
  ).min(1, "At least one seat category is required"),
});

const CreateEvent = () => {
  const navigate = useNavigate();
  const { mutate: createEvent, isPending } = useCreateEvent(); // Use the hook
  
  // File States (React Hook Form doesn't handle FileLists nicely)
  const [banner, setBanner] = useState(null);
  const [gallery, setGallery] = useState([]);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      seatConfig: [{ category: "GENERAL", count: 100, price: 1000 }], 
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "seatConfig",
  });

  const onSubmit = (data) => {
    // ⚠️ CRITICAL VALIDATION
    if (!banner) {
      alert("Please upload a banner image"); // Or use toast
      return;
    }

    const formData = new FormData();
    
    // 1. Text Fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("location", data.location);
    formData.append("date", data.date);

    // 2. Files
    formData.append("banner", banner); // Backend: upload.single('banner')
    
    Array.from(gallery).forEach((file) => {
      formData.append("gallery", file); // Backend: upload.array('gallery')
    });

    // 3. THE TRAP FIX: Stringify seatConfig
    formData.append("seatConfig", JSON.stringify(data.seatConfig));

    createEvent(formData, {
      onSuccess: () => {
        navigate("/"); // Redirect home after success
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="h2 text-2xl">Create New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Event Title</Label>
                  <Input {...register("title")} placeholder="e.g. New Year Concert" />
                  {errors.title && <p className="p3 text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...register("date")} />
                  {errors.date && <p className="p3 text-red-500">{errors.date.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input {...register("location")} placeholder="e.g. Dasharath Rangasala" />
                {errors.location && <p className="p3 text-red-500">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...register("description")} placeholder="Event details..." />
                {errors.description && <p className="p3 text-red-500">{errors.description.message}</p>}
              </div>
            </div>

            <Separator />

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Banner Image (Cover)</Label>
                <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="banner-upload"
                    onChange={(e) => setBanner(e.target.files[0])} 
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">{banner ? banner.name : "Click to Upload Banner"}</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gallery Images (Optional)</Label>
                <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition">
                  <Input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    id="gallery-upload"
                    onChange={(e) => setGallery(e.target.files)} 
                  />
                  <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">{gallery.length > 0 ? `${gallery.length} files selected` : "Click to Upload Gallery"}</span>
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Seat Configuration */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label className="h3 text-lg">Seat Configuration</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ category: "", count: 0, price: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-end p-3 bg-slate-50 rounded-md border">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Input placeholder="VIP" {...register(`seatConfig.${index}.category`)} />
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Count</Label>
                      <Input type="number" {...register(`seatConfig.${index}.count`)} />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Price</Label>
                      <Input type="number" {...register(`seatConfig.${index}.price`)} />
                    </div>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {errors.seatConfig && <p className="p3 text-red-500 mt-2">{errors.seatConfig.message}</p>}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit" className="w-full text-lg h-12" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEvent;