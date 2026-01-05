import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useVerifyTicket } from "@/hooks/useTickets"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const VerifyTicket = () => {
  const [scanResult, setScanResult] = useState(null); 
  const scannerRef = useRef(null);

  // Use the custom hook
  const { mutate: verifyTicket, isPending } = useVerifyTicket();

  // --- SCANNER LOGIC ---
  useEffect(() => {
    if (scannerRef.current) return;

    const onScanSuccess = (decodedText) => {
      scannerRef.current.clear(); 
      
      // Call mutation from hook
      verifyTicket(decodedText, {
        onSuccess: (data) => {
          setScanResult({
            status: "success",
            ticket: data.data,
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
      // console.warn(error);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    scannerRef.current = new Html5QrcodeScanner("reader", config, false);
    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
        scannerRef.current = null;
      }
    };
  }, [verifyTicket]);

  const handleReset = () => {
    window.location.reload(); 
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="h1 mb-8 text-center">Ticket Verification</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: Scanner Box */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="h2">Scan QR Code</CardTitle>
            <CardDescription className="p1 text-sm">Point camera at the attendee's ticket.</CardDescription>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-slate-200"></div>
            ) : (
               <div className="h-[300px] flex flex-col items-center justify-center bg-slate-50 rounded-lg border">
                 <p className="p1 mb-4">Scanner Paused</p>
                 <Button onClick={handleReset} variant="outline">
                   <RefreshCw className="mr-2 h-4 w-4" /> Scan Another
                 </Button>
               </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Result Display */}
        <Card className={`border-t-4 transition-colors ${
          !scanResult 
            ? "border-t-slate-200" 
            : scanResult.status === "success" 
              ? "border-t-green-500 bg-green-50/50" 
              : "border-t-red-500 bg-red-50/50"
        }`}>
          <CardHeader>
            <CardTitle className="h2">Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {isPending && (
              <div className="flex flex-col items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="p1">Verifying Ticket...</p>
              </div>
            )}

            {!scanResult && !isPending && (
              <div className="text-center py-10">
                <p className="p1">Waiting for scan...</p>
              </div>
            )}

            {scanResult && scanResult.status === "success" && (
              <div className="text-center space-y-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="h2 text-green-700">Valid Ticket</h3>
                
                <div className="bg-white p-4 rounded-md border shadow-sm text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="p1 text-sm">Holder:</span>
                    <span className="font-semibold">{scanResult.ticket?.holder}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="p1 text-sm">Seat:</span>
                    <Badge variant="outline" className="font-mono text-lg">{scanResult.ticket?.seat}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="p1 text-sm">Event:</span>
                    <span className="font-medium text-sm text-right">{scanResult.ticket?.event || "Event Name"}</span>
                  </div>
                </div>
              </div>
            )}

            {scanResult && scanResult.status === "error" && (
              <div className="text-center space-y-4">
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                <h3 className="h2 text-red-700">Invalid Ticket</h3>
                <p className="p1 text-red-600 font-medium">{scanResult.message}</p>
                <div className="p-4 bg-white rounded border border-red-200 text-sm">
                  <p className="p1 text-xs mb-2">Possible reasons:</p>
                  <ul className="list-disc list-inside p1 text-xs">
                    <li>Ticket has already been used</li>
                    <li>QR code belongs to a different event</li>
                    <li>Forged or fake QR code</li>
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