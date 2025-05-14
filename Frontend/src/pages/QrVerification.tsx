// import React, { useState, useRef } from 'react';
// import { QrCode, Camera, CheckCircle, XCircle } from 'lucide-react';
// import { Card, CardContent, CardHeader } from '../UI/Card';
// import Button from '../UI/Button1';
// import Badge from '../UI/Badge';

// const QRVerification: React.FC = () => {
//   const [isScanning, setIsScanning] = useState(false);
//   const [verificationResult, setVerificationResult] = useState<{
//     isValid: boolean;
//     data?: {
//       application_id: string;
//       student_name: string;
//       exam_name: string;
//       exam_date: string;
//       exam_time?: string;
//       location?: string;
//     };
//   } | null>(null);
  
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
  
//   const startScanning = async () => {
//     setIsScanning(true);
//     setVerificationResult(null);
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.play();
//       }
      
//       // In a real app, this would use a QR code scanning library
//       // For demo purposes, we'll simulate a scan after 3 seconds
//       setTimeout(() => {
//         // Simulate a successful scan
//         const mockData = {
//           isValid: true,
//           data: {
//             application_id: 'APP002',
//             student_name: 'Jane Smith',
//             exam_name: 'Mathematics Final Exam',
//             exam_date: '2025-05-15',
//             exam_time: '10:00',
//             location: 'Main Campus',
//           },
//         };
        
//         setVerificationResult(mockData);
//         stopScanning();
//       }, 3000);
//     } catch (error) {
//       console.error('Error accessing camera:', error);
//       setIsScanning(false);
//     }
//   };
  
//   const stopScanning = () => {
//     if (videoRef.current && videoRef.current.srcObject) {
//       const stream = videoRef.current.srcObject as MediaStream;
//       const tracks = stream.getTracks();
      
//       tracks.forEach(track => track.stop());
//       videoRef.current.srcObject = null;
//     }
    
//     setIsScanning(false);
//   };
  
//   const resetVerification = () => {
//     setVerificationResult(null);
//   };
  
//   // Simulate manual verification by application ID
//   const [manualApplicationId, setManualApplicationId] = useState('');
  
//   const handleManualVerification = () => {
//     if (!manualApplicationId) return;
    
//     // In a real app, this would be an API call
//     // For demo purposes, we'll simulate a verification
    
//     // Simulate a successful verification for APP002
//     if (manualApplicationId === 'APP002') {
//       setVerificationResult({
//         isValid: true,
//         data: {
//           application_id: 'APP002',
//           student_name: 'Jane Smith',
//           exam_name: 'Mathematics Final Exam',
//           exam_date: '2025-05-15',
//           exam_time: '10:00',
//           location: 'Main Campus',
//         },
//       });
//     } else {
//       // Simulate an invalid verification for any other ID
//       setVerificationResult({
//         isValid: false,
//       });
//     }
    
//     setManualApplicationId('');
//   };
  
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">QR Code Verification</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <h2 className="text-lg font-medium">Scan QR Code</h2>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="bg-gray-100 rounded-md aspect-square flex items-center justify-center overflow-hidden relative">
//                 {isScanning ? (
//                   <video
//                     ref={videoRef}
//                     className="absolute inset-0 w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="text-center p-8">
//                     <QrCode size={64} className="mx-auto text-gray-400 mb-4" />
//                     <p className="text-gray-500">
//                       {verificationResult
//                         ? 'Verification complete'
//                         : 'Camera preview will appear here'}
//                     </p>
//                   </div>
//                 )}
//                 <canvas ref={canvasRef} className="hidden" />
//               </div>
              
//               <div className="flex justify-center">
//                 {isScanning ? (
//                   <Button
//                     variant="outline"
//                     onClick={stopScanning}
//                   >
//                     Cancel Scan
//                   </Button>
//                 ) : (
//                   <Button
//                     onClick={startScanning}
//                     disabled={!!verificationResult}
//                   >
//                     <Camera size={16} className="mr-2" />
//                     Start Scanning
//                   </Button>
//                 )}
//               </div>
              
//               <div className="mt-4">
//                 <p className="text-sm text-gray-600 mb-2">Or enter application ID manually:</p>
//                 <div className="flex space-x-2">
//                   <input
//                     type="text"
//                     value={manualApplicationId}
//                     onChange={(e) => setManualApplicationId(e.target.value)}
//                     placeholder="Enter Application ID"
//                     className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                   />
//                   <Button
//                     onClick={handleManualVerification}
//                     disabled={!manualApplicationId}
//                   >
//                     Verify
//                   </Button>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Try "APP002" for a successful verification demo
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader>
//             <h2 className="text-lg font-medium">Verification Result</h2>
//           </CardHeader>
//           <CardContent>
//             {verificationResult ? (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md">
//                   {verificationResult.isValid ? (
//                     <div className="flex items-center text-green-600">
//                       <CheckCircle size={24} className="mr-2" />
//                       <span className="text-lg font-medium">Valid Hall Ticket</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center text-red-600">
//                       <XCircle size={24} className="mr-2" />
//                       <span className="text-lg font-medium">Invalid Hall Ticket</span>
//                     </div>
//                   )}
//                 </div>
                
//                 {verificationResult.isValid && verificationResult.data && (
//                   <div className="space-y-3 mt-4">
//                     <div>
//                       <h3 className="text-sm font-medium text-gray-500">Application ID</h3>
//                       <p>{verificationResult.data.application_id}</p>
//                     </div>
                    
//                     <div>
//                       <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
//                       <p>{verificationResult.data.student_name}</p>
//                     </div>
                    
//                     <div>
//                       <h3 className="text-sm font-medium text-gray-500">Exam</h3>
//                       <p>{verificationResult.data.exam_name}</p>
//                     </div>
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500">Date</h3>
//                         <p>{new Date(verificationResult.data.exam_date).toLocaleDateString()}</p>
//                       </div>
                      
//                       {verificationResult.data.exam_time && (
//                         <div>
//                           <h3 className="text-sm font-medium text-gray-500">Time</h3>
//                           <p>{verificationResult.data.exam_time}</p>
//                         </div>
//                       )}
//                     </div>
                    
//                     {verificationResult.data.location && (
//                       <div>
//                         <h3 className="text-sm font-medium text-gray-500">Location</h3>
//                         <p>{verificationResult.data.location}</p>
//                       </div>
//                     )}
                    
//                     <div className="pt-4">
//                       <Badge variant="success" className="text-sm">
//                         Student Verified
//                       </Badge>
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="flex justify-center mt-4">
//                   <Button
//                     variant="outline"
//                     onClick={resetVerification}
//                   >
//                     Verify Another
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-64 text-center">
//                 <QrCode size={48} className="text-gray-300 mb-4" />
//                 <p className="text-gray-500">Scan a QR code to see verification results</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default QRVerification;