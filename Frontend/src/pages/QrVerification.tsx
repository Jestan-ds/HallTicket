// // src/pages/QRVerification.tsx

// import React, { useState, useCallback, useEffect, useRef } from 'react'; // Ensure useEffect is imported
// import CameraComponent, { FACING_MODES, IMAGE_TYPES } from 'react-html5-camera-photo'; // Renamed to CameraComponent
// import 'react-html5-camera-photo/build/css/index.css';
// import jsQR from 'jsqr';
// import { QrCode, CheckCircle, XCircle, AlertTriangle, Loader2, Camera as CameraIcon } from 'lucide-react';
// import { Card, CardContent, CardHeader } from '../UI/Card';
// import Button from '../UI/Button1';
// import Input from '../UI/Input1';

// const API_BASE_URL = 'http://localhost:5000/api';

// // --- TypeScript Interfaces (remain the same) ---
// interface ScannedQrData {
//     name: string;
//     dob: string;
//     examName: string;
//     appId: string;
//     userId: number | string;
//     rollNo: string;
// }

// interface BackendVerificationData {
//     applicationId: string;
//     studentName: string;
//     dob: string;
//     rollNumber: string;
//     examName: string;
//     examDate: string;
//     examTime?: string | null;
//     examVenue?: string | null;
//     status: 'approved' | 'pending' | 'rejected' | string;
//     error?: string;
// }

// interface VerificationResult {
//     isAuthentic: boolean;
//     isApproved: boolean;
//     message: string;
//     scannedData?: ScannedQrData;
//     officialData?: BackendVerificationData;
// }
// // --- End TypeScript Interfaces ---

// const QRVerification: React.FC = () => {
//     const [showScanner, setShowScanner] = useState(false);
//     const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
//     const [manualApplicationId, setManualApplicationId] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [scannerError, setScannerError] = useState<string | null>(null);
//     const [apiError, setApiError] = useState<string | null>(null);
//     const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

//     const canvasRef = useRef<HTMLCanvasElement | null>(null);
//     useEffect(() => {
//         // Create the canvas element once and store it in the ref
//         // This canvas is used off-screen for processing the image data
//         if (!canvasRef.current) { // Check if it's not already created
//             canvasRef.current = document.createElement('canvas');
//         }
//     }, []); // Empty dependency array, so this runs once on mount


//     const processQrCodeContent = useCallback(async (decodedText: string | null) => {
//         // ... (processQrCodeContent logic remains the same as your last working version for this part)
//         if (!decodedText) {
//             setScannerError("Failed to decode QR code text from image.");
//             setIsProcessingPhoto(false);
//             return;
//         }
//         // No need for lastScannedData check here if isProcessingPhoto handles debounce

//         setIsLoading(true);
//         setApiError(null);
//         setVerificationResult(null);
//         // setShowScanner(false); // Scanner will be hidden by parent after this call returns

//         let parsedQrData: ScannedQrData;
//         try {
//             parsedQrData = JSON.parse(decodedText);
//             if (!parsedQrData.appId || !parsedQrData.name || !parsedQrData.rollNo) {
//                 throw new Error("QR code data is incomplete or malformed.");
//             }
//         } catch (e: any) {
//             setApiError(`Invalid QR Code Content: ${e.message || "Could not parse QR content."}`);
//             setVerificationResult({ isAuthentic: false, isApproved: false, message: "Invalid QR Code content." });
//             setIsLoading(false);
//             setIsProcessingPhoto(false);
//             return;
//         }

//         try {
//             const response = await fetch(`${API_BASE_URL}/examRegistration/registered-exams/${parsedQrData.appId}`);
//             const backendData: BackendVerificationData = await response.json();

//             if (!response.ok) {
//                 throw new Error(backendData.error || `Verification failed for App ID: ${parsedQrData.appId}. Server responded: ${response.status}`);
//             }

//             const isNameMatch = parsedQrData.name.trim().toLowerCase() === backendData.studentName?.trim().toLowerCase();
//             const isRollNoMatch = parsedQrData.rollNo === backendData.rollNumber;
//             const isDobMatch = parsedQrData.dob === backendData.dob;

//             const isAuthentic = isNameMatch && isRollNoMatch && isDobMatch;
//             const isApprovedStatus = backendData.status === 'approved';
//             let message = "";

//             if (isAuthentic) {
//                 message = isApprovedStatus ? "Hall Ticket VERIFIED & APPROVED." : `Hall Ticket Verified, but status is: ${backendData.status?.toUpperCase()}. Not Approved.`;
//             } else {
//                 message = "VERIFICATION FAILED: Data mismatch.";
//             }

//             setVerificationResult({
//                 isAuthentic,
//                 isApproved: isApprovedStatus,
//                 message,
//                 scannedData: parsedQrData,
//                 officialData: backendData,
//             });

//         } catch (e: any) {
//             console.error("Verification API error:", e);
//             setApiError(`Verification Error: ${e.message}`);
//             setVerificationResult({
//                 isAuthentic: false,
//                 isApproved: false,
//                 message: `Error during verification: ${e.message}`,
//                 scannedData: parsedQrData,
//             });
//         } finally {
//             setIsLoading(false);
//             setIsProcessingPhoto(false);
//         }
//     }, []);


//     const dataUriToImageData = (dataURI: string, callback: (imageData: ImageData | null) => void) => {
//         if (!canvasRef.current) {
//             console.error("Canvas ref not initialized for dataUriToImageData");
//             callback(null);
//             return;
//         }
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d');
//         if (!context) {
//             console.error("Could not get 2D context from canvas");
//             callback(null);
//             return;
//         }

//         const image = new Image();
//         image.onload = () => {
//             canvas.width = image.naturalWidth > 0 ? image.naturalWidth : 640; // Fallback width
//             canvas.height = image.naturalHeight > 0 ? image.naturalHeight : 480; // Fallback height
//             context.drawImage(image, 0, 0, canvas.width, canvas.height);
//             try {
//                 const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//                 callback(imageData);
//             } catch (e) {
//                 console.error("Error getting ImageData from canvas:", e);
//                 callback(null);
//             }
//         };
//         image.onerror = () => {
//             console.error("Failed to load image from data URI for canvas drawing.");
//             callback(null);
//         };
//         image.src = dataURI; // Directly use the data URI
//     };

//     const handleTakePhotoAnimationDone = useCallback((dataUri: string) => {
//         if (isProcessingPhoto || isLoading) return; // Prevent multiple rapid processing

//         setIsProcessingPhoto(true);
//         setScannerError(null);

//         dataUriToImageData(dataUri, (imageData) => {
//             if (imageData) {
//                 const code = jsQR(imageData.data, imageData.width, imageData.height, {
//                     inversionAttempts: "dontInvert",
//                 });
//                 if (code && code.data) {
//                     setShowScanner(false); // Successfully decoded, hide scanner UI
//                     processQrCodeContent(code.data);
//                 } else {
//                     setScannerError("No QR code detected. Please adjust camera and try taking photo again.");
//                     setIsProcessingPhoto(false); // Allow retrying photo
//                     // Keep scanner active (showScanner remains true until processQrCodeContent sets it false or user closes)
//                 }
//             } else {
//                 setScannerError("Could not process image. Please try again.");
//                 setIsProcessingPhoto(false); // Allow retrying photo
//             }
//         });
//     }, [processQrCodeContent, isProcessingPhoto, isLoading]);


//     const handleCameraError = useCallback((error: Error) => {
//         console.error('react-html5-camera-photo error:', error);
//         let displayError = `Camera Error: ${error.message || "Failed to initialize camera."}`;
//         // ... (error message parsing as before) ...
//         if (error.name === 'NotAllowedError') {
//             displayError = "Camera permission denied. Please allow camera access in browser settings.";
//         } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
//             displayError = "No camera found. Please ensure a camera is connected and enabled.";
//         } else if (error.name === 'NotReadableError') {
//              displayError = "Camera is already in use by another application or tab.";
//         }
//         setScannerError(displayError);
//         setShowScanner(false); // Stop trying to use the camera on critical error
//         setIsProcessingPhoto(false);
//     }, []);


//     const startScanningFlow = () => {
//         setVerificationResult(null);
//         setApiError(null);
//         setScannerError(null);
//         setIsProcessingPhoto(false);
//         setShowScanner(true); // This will render the <CameraComponent />
//     };

//     const stopScanningFlow = () => {
//         setShowScanner(false); // This will unmount the <CameraComponent />
//         setIsProcessingPhoto(false);
//     };

//     const handleManualVerification = () => {
//         // ... (manual verification logic remains the same) ...
//         const trimmedAppId = manualApplicationId.trim();
//         if (!trimmedAppId) {
//             setApiError("Please enter an Application ID.");
//             return;
//         }
//         setShowScanner(false);
//         const simulatedQrJsonString = JSON.stringify({
//             appId: trimmedAppId, name: "Manual Lookup", dob: "N/A",
//             examName: "N/A", userId: "N/A", rollNo: "N/A"
//         });
//         processQrCodeContent(simulatedQrJsonString); // processQrCodeContent will set isLoading and eventually isProcessingPhoto to false
//         setManualApplicationId('');
//     };

//     const resetVerification = () => {
//         setVerificationResult(null);
//         setApiError(null);
//         setScannerError(null);
//         setShowScanner(false);
//         setIsProcessingPhoto(false);
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Hall Ticket QR Verification</h1>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <Card className="shadow-lg">
//                     <CardHeader>
//                         <h2 className="text-xl font-semibold text-gray-700 flex items-center">
//                             <QrCode size={24} className="mr-2 text-indigo-600" /> Scan QR Code
//                         </h2>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                         <div
//                             className="w-full bg-gray-200 rounded-md overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center"
//                             style={{ minHeight: '280px', aspectRatio: '1 / 1', position: 'relative' }}
//                         >
//                            {showScanner ? (
//                                 <CameraComponent // Use the renamed import
//                                     onTakePhotoAnimationDone = {handleTakePhotoAnimationDone}
//                                     onCameraError = {handleCameraError}
//                                     idealFacingMode = {FACING_MODES.ENVIRONMENT}
//                                     idealResolution = {{width: 640, height: 480}}
//                                     imageType = {IMAGE_TYPES.JPG}
//                                     imageCompression = {0.92}
//                                     isMaxResolution = {false}
//                                     isImageMirror = {false}
//                                     isSilentMode = {true}
//                                     isDisplayStartCameraError = {true}
//                                     sizeFactor = {1}
//                                 />
//                            ) : (
//                                 <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
//                                     {scannerError && !isLoading && !apiError && !verificationResult && (
//                                         <>
//                                             <AlertTriangle size={32} className="mb-2 text-red-500" />
//                                             <p className="text-center text-sm text-red-500">{scannerError}</p>
//                                             <Button onClick={startScanningFlow} variant="outline" size="sm" className="mt-3">Try Scan Again</Button>
//                                         </>
//                                     )}
//                                     {!scannerError && !isLoading && !apiError && !verificationResult && (
//                                         <>
//                                             <CameraIcon size={48} className="mb-3" />
//                                             <p className="text-center text-sm">Click "Start Scanning" to activate camera.</p>
//                                         </>
//                                     )}
//                                 </div>
//                             )}
//                         </div>

//                         <div className="flex justify-center">
//                             {!showScanner ? (
//                                 <Button onClick={startScanningFlow} disabled={isLoading || !!verificationResult || isProcessingPhoto} className="w-full py-3 text-base">
//                                     <CameraIcon size={18} className="mr-2" /> Start Scanning
//                                 </Button>
//                             ) : (
//                                 <Button onClick={stopScanningFlow} variant="outline" className="w-full py-3 text-base">
//                                     Stop/Close Camera
//                                 </Button>
//                             )}
//                         </div>
//                         <div className="text-center mt-4">
//                             {/* ... manual verification input ... */}
//                             <p className="text-sm text-gray-600">Or enter Application ID manually:</p>
//                             <div className="flex space-x-2 mt-2">
//                                 <Input
//                                     type="text"
//                                     value={manualApplicationId}
//                                     onChange={(e) => setManualApplicationId(e.target.value)}
//                                     placeholder="Application ID"
//                                     className="flex-grow !py-2.5 text-sm"
//                                     disabled={isLoading || showScanner}
//                                 />
//                                 <Button onClick={handleManualVerification} disabled={!manualApplicationId.trim() || isLoading || showScanner} className="py-2.5 text-sm">
//                                     Verify
//                                 </Button>
//                             </div>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Verification Result Card JSX (Keep as is) */}
//                 <Card className="shadow-lg">
//                     <CardHeader><h2 className="text-xl font-semibold text-gray-700">Verification Status</h2></CardHeader>
//                     <CardContent className="min-h-[300px] flex flex-col items-center justify-center p-6">
//                         {isLoading && ( <div className="text-center"><Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" /><p className="text-lg font-medium text-gray-700">Verifying...</p></div>)}
//                         {apiError && !isLoading && ( <div className="text-center text-red-600 p-4 bg-red-50 rounded-md w-full border border-red-300"><AlertTriangle size={32} className="mx-auto mb-2" /><p className="font-semibold">Verification Error</p><p className="text-sm">{apiError}</p><Button onClick={resetVerification} variant="outline" className="mt-4 text-sm py-2">Try Again</Button></div>)}
//                         {verificationResult && !isLoading && !apiError && (
//                             <div className="w-full space-y-3">
//                                 <div className={`flex items-center justify-center p-3 rounded-md text-md font-semibold break-words ${verificationResult.isAuthentic && verificationResult.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//                                     {verificationResult.isAuthentic && verificationResult.isApproved ? <CheckCircle size={24} className="mr-2 shrink-0" /> : <XCircle size={24} className="mr-2 shrink-0" />}
//                                     <span className="text-center">{verificationResult.message}</span>
//                                 </div>
//                                 {verificationResult.officialData && (
//                                     <div className="text-xs space-y-1.5 border p-3 rounded-md bg-gray-50">
//                                         <h3 className="text-sm font-semibold text-gray-800 mb-1">Official Record:</h3>
//                                         <p><strong>Name:</strong> {verificationResult.officialData.studentName}
//                                             {(!verificationResult.isAuthentic && verificationResult.scannedData?.name !== verificationResult.officialData.studentName) &&
//                                              <span className="text-red-500 text-xs ml-1">(QR: {verificationResult.scannedData?.name})</span>}
//                                         </p>
//                                         <p><strong>App ID:</strong> {verificationResult.officialData.applicationId}</p>
//                                         <p><strong>Roll No:</strong> {verificationResult.officialData.rollNumber}
//                                             {(!verificationResult.isAuthentic && verificationResult.scannedData?.rollNo !== verificationResult.officialData.rollNumber) &&
//                                              <span className="text-red-500 text-xs ml-1">(QR: {verificationResult.scannedData?.rollNo})</span>}
//                                         </p>
//                                         <p><strong>DOB:</strong> {verificationResult.officialData.dob}
//                                              {(!verificationResult.isAuthentic && verificationResult.scannedData?.dob !== verificationResult.officialData.dob) &&
//                                               <span className="text-red-500 text-xs ml-1">(QR: {verificationResult.scannedData?.dob})</span>}
//                                         </p>
//                                         <p><strong>Exam:</strong> {verificationResult.officialData.examName}</p>
//                                         <p><strong>Date:</strong> {verificationResult.officialData.examDate} {verificationResult.officialData.examTime && <>@ {verificationResult.officialData.examTime}</>}</p>
//                                         <p><strong>Venue:</strong> {verificationResult.officialData.examVenue || 'N/A'}</p>
//                                         <p><strong>DB Status:</strong> <span className={`font-semibold ${verificationResult.officialData.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{verificationResult.officialData.status?.toUpperCase()}</span></p>
//                                     </div>
//                                 )}
//                                  {verificationResult.scannedData && !verificationResult.isAuthentic && verificationResult.officialData && (
//                                     <div className="text-xs space-y-1.5 border border-orange-300 p-3 rounded-md bg-orange-50 mt-2">
//                                         <h3 className="text-sm font-semibold text-orange-700 mb-1">Data from Scanned QR (Mismatch):</h3>
//                                         <p><strong>Name:</strong> {verificationResult.scannedData.name}</p>
//                                         <p><strong>Roll No:</strong> {verificationResult.scannedData.rollNo}</p>
//                                         <p><strong>DOB:</strong> {verificationResult.scannedData.dob}</p>
//                                         <p><strong>App ID:</strong> {verificationResult.scannedData.appId}</p>
//                                     </div>
//                                  )}
//                                 <Button onClick={resetVerification} variant="outline" className="w-full mt-4 py-2.5 text-sm"> Verify Another</Button>
//                             </div>
//                         )}
//                          {!isLoading && !verificationResult && !apiError && !scannerError && (
//                              <div className="text-center text-gray-500 p-4">
//                                  <QrCode size={48} className="mx-auto mb-3 text-gray-400" />
//                                  <p className="text-sm">Scan QR or enter Application ID to begin.</p>
//                              </div>
//                          )}
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default QRVerification;