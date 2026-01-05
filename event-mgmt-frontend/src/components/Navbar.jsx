import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Ticket, 
  Zap 
} from "lucide-react";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="border-b border-slate-200/60 bg-[#F8F6F0]/90 backdrop-blur-lg sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4"> 

        <Link to="/" className="flex items-center gap-3 group">
 
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-black shadow-md group-hover:scale-105 transition-all duration-300">
            <Ticket className="h-5 w-5 text-white fill-white" />
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-black leading-none uppercase">
              Mero Ticket
            </span>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full hover:bg-slate-200/50 transition-colors">
                  <Avatar className="h-11 w-11 border-2 border-white shadow-md transition-transform hover:scale-105">
                    <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                    <AvatarFallback className="bg-black text-white font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-60 mt-2 p-1 bg-[#F8F6F0] backdrop-blur-xl border-slate-200 shadow-xl rounded-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-4 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-bold leading-none text-slate-900">{user?.name}</p>
                    <p className="text-xs leading-none text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-slate-200" />
                
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-white hover:shadow-sm py-2.5 px-3 my-1 transition-all">
                  <Link to="/profile" className="flex items-center text-slate-700 font-medium">
                    <User className="mr-3 h-4 w-4 text-slate-500" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-white hover:shadow-sm py-2.5 px-3 my-1 transition-all">
                  <Link to="/bookings" className="flex items-center text-slate-700 font-medium">
                    <Ticket className="mr-3 h-4 w-4 text-slate-500" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
                
                {(user?.role === "ADMIN" || user?.role === "ORGANIZER") && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-200" />
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-slate-100 py-2.5 px-3 my-1">
                      <Link to="/admin/dashboard" className="flex items-center font-medium">
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-slate-200" />
                
                <DropdownMenuItem 
                  onClick={logout} 
                  className="rounded-lg cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 hover:bg-red-50 py-2.5 px-3 my-1"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="text-slate-600 hover:text-black hover:bg-[#eae8e4] font-medium">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="rounded-full shadow-lg bg-black text-white hover:bg-gray-800 hover:scale-105 transition-all px-7 font-bold h-11">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
