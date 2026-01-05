import { Ticket } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-white py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">TicketHive</span>
        </div>
        
        <p className="text-sm text-muted-foreground text-center md:text-left">
          &copy; {new Date().getFullYear()} TicketHive Inc. All rights reserved.
        </p>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary">Terms</a>
          <a href="#" className="hover:text-primary">Privacy</a>
          <a href="#" className="hover:text-primary">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;