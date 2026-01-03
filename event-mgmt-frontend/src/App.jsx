import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import Home from "@/pages/Home";

// Create a client for data fetching
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      
      {/* Global Notification System */}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;