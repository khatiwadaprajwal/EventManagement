import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useVerifyTicket } from "@/hooks/useTickets"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Ticket } from "lucide-react";

const VerifyTicket = () => {
  const [scanResult, setScanResult] = useState(null); 
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  // Use the custom hook
  const { mutate: verifyTicket, isPending } = useVerifyTicket();

  useEffect(() => {
    // Prevent double initialization
    if (scannerInstanceRef.current) return;

    const onScanSuccess = (decodedText) => {
      // 1. Pause scanning immediately upon success
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear();
      }
      
      // 2. Extract Data logic (Optional: Handle full URLs if needed)
      // If code is "http://localhost.../TICKET-123", split it. 
      // Otherwise assume it's just "TICKET-123"
      let qrCode = decodedText;
      if (decodedText.includes("/verify/")) {
        qrCode = decodedText.split("/verify/")[1];
      }

      // 3. Call API
      verifyTicket(qrCode, {
        onSuccess: (data) => {
          setScanResult({
            status: "success",
            ticket: data.data, // Contains { valid, holder, seat, event }
            message: data.message
          });
        },
        onError: (err) => {
          setScanResult({
            status: "error",
            message: err.response?.data?.message || "Invalid Ticket"
          });
        }
      });
    };

    const onScanFailure = (error) => {
      // Intentionally empty to prevent console spam while scanning
    };

    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };
    
    // Initialize Scanner
    const scanner = new Html5QrcodeScanner("reader", config, false);
    scanner.render(onScanSuccess, onScanFailure);
    scannerInstanceRef.current = scanner;

    // Cleanup
    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear().catch(() => {});
        scannerInstanceRef.current = null;
      }
    };
  }, [verifyTicket]);

  const handleReset = () => {
    window.location.reload(); 
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="h1 mb-8 text-center flex items-center justify-center gap-3">
        <Ticket className="h-8 w-8" /> Ticket Verification
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* LEFT: Scanner Box */}
        <Card className="h-fit shadow-md">
          <CardHeader>
            <CardTitle className="h2 text-lg">Scan QR Code</CardTitle>
            <CardDescription className="p1 text-sm">Point camera at the attendee's ticket.</CardDescription>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-slate-200"></div>
            ) : (
               <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-lg border border-dashed">
                 <p className="p1 mb-4 text-muted-foreground font-medium">Scanner Paused</p>
                 <Button onClick={handleReset} variant="outline" className="border-slate-300">
                   <RefreshCw className="mr-2 h-4 w-4" /> Scan Another
                 </Button>
               </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Result Display */}
        <Card className={`border-t-4 shadow-md transition-all duration-300 ${
          !scanResult 
            ? "border-t-slate-200" 
            : scanResult.status === "success" 
              ? "border-t-green-500 bg-green-50/30" 
              : "border-t-red-500 bg-red-50/30"
        }`}>
          <CardHeader>
            <CardTitle className="h2 text-lg">Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {isPending && (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="p1 font-medium">Verifying Ticket...</p>
              </div>
            )}

            {!scanResult && !isPending && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="p1">Waiting for scan...</p>
              </div>
            )}

            {scanResult && scanResult.status === "success" && (
              <div className="text-center space-y-5 animate-in fade-in zoom-in duration-300">
                <div className="bg-white rounded-full p-2 w-fit mx-auto shadow-sm">
                   <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <h3 className="h2 text-green-700 text-2xl">Valid Ticket</h3>
                
                <div className="bg-white p-5 rounded-lg border shadow-sm text-left space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="p1 text-sm text-muted-foreground">Holder</span>
                    <span className="font-bold text-lg">{scanResult.ticket?.holder}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="p1 text-sm text-muted-foreground">Seat</span>
                    <Badge variant="outline" className="font-mono text-lg border-green-200 bg-green-50 text-green-700">
                        {scanResult.ticket?.seat}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="p1 text-sm text-muted-foreground">Event</span>
                    <span className="font-medium text-sm text-right">{scanResult.ticket?.event || "Event Name"}</span>
                  </div>
                </div>
              </div>
            )}

            {scanResult && scanResult.status === "error" && (
              <div className="text-center space-y-5 animate-in fade-in zoom-in duration-300">
                <div className="bg-white rounded-full p-2 w-fit mx-auto shadow-sm">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <h3 className="h2 text-red-700 text-2xl">Invalid Ticket</h3>
                <p className="p1 text-red-600 font-medium">{scanResult.message}</p>
                
                <div className="p-4 bg-white/80 rounded border border-red-200 text-sm text-left">
                  <p className="p1 text-xs font-bold mb-2 uppercase text-red-400">Possible reasons:</p>
                  <ul className="list-disc list-inside p1 text-xs text-slate-600 space-y-1">
                    <li>Ticket has already been scanned/used.</li>
                    <li>QR code belongs to a different event.</li>
                    <li>Forged or fake QR code.</li>
                  </ul>
                </div>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyTicket;