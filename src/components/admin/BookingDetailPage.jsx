"use client";
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Image from 'next/image';
import CustomerProfileModal from '@/components/admin/CustomerProfileModal';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Bike,
  DollarSign,
  Star,
  AlertTriangle,
  Droplet
} from 'lucide-react';
import { Tag as TagIcon } from 'lucide-react';
import IntegratedReturnProcess from './IntegratedReturnProcess';

export default function BookingDetailPage({ bookingId }) {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [showReturnInspection, setShowReturnInspection] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerProfile, setShowCustomerProfile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Fetch booking details
  const booking = useQuery(api.bookings.getBikeBookingById, 
    bookingId ? { bookingId } : "skip"
  );

  const userData = useQuery(
    api.users.getUser, 
    booking?.userId ? { userId: booking.userId } : "skip"
  );
  
  // Fetch bike details
  const bike = useQuery(
    api.bikes.getBikeById, 
    booking?.bikeId ? { bikeId: booking.bikeId } : "skip"
  );
  
  // Update booking status mutation
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);
  
  // Complete payment mutation
  const completePayment = useMutation(api.bookings.completePayment);

  // Check if user is admin
  const isAdmin = useQuery(
    api.users.isAdmin,
    isUserLoaded ? { userId: user?.id } : "skip"
  );

  const isLoading = !booking || !bike;

  const handleUpdateStatus = async (status) => {
    if (!isUserLoaded || !user || !bookingId) return;
    try {
      await updateBookingStatus({
        bookingId,
        status,
        userId: user.id,
      });
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error(error.message || "Failed to update booking status");
    }
  };

  const handleCompletePayment = async () => {
    if (!isUserLoaded || !user || !bookingId) return;
    try {
      await completePayment({
        bookingId,
        adminId: user.id,
        paymentMethod,
      });
      toast.success("Payment completed successfully");
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error completing payment:", error);
      toast.error(error.message || "Failed to complete payment");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 flex justify-center items-center h-64">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Render status badge
  const StatusBadge = ({ status }) => {
    let colorClass = "";
    let icon = null;
    
    switch (status) {
      case "pending":
        colorClass = "bg-yellow-100 text-yellow-800";
        icon = <Clock className="h-4 w-4 mr-1" />;
        break;
      case "confirmed":
        colorClass = "bg-green-100 text-green-800";
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      case "cancelled":
        colorClass = "bg-red-100 text-red-800";
        icon = <XCircle className="h-4 w-4 mr-1" />;
        break;
      case "completed":
        colorClass = "bg-blue-100 text-blue-800";
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800";
        icon = <Clock className="h-4 w-4 mr-1" />;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {icon}
        {status}
      </span>
    );
  };

  // Payment status badge
  const PaymentStatusBadge = ({ paymentStatus }) => {
    if (!paymentStatus) return null;
    
    let colorClass = "";
    let label = paymentStatus;
    
    switch (paymentStatus) {
      case 'pending':
        colorClass = "bg-yellow-100 text-yellow-800";
        label = "Payment Pending";
        break;
      case 'deposit_paid':
        colorClass = "bg-green-100 text-green-800";
        label = "Deposit Paid";
        break;
      case 'fully_paid':
        colorClass = "bg-blue-100 text-blue-800";
        label = "Fully Paid";
        break;
      default:
        colorClass = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        <DollarSign className="h-4 w-4 mr-1" />
        {label}
      </span>
    );
  };

  // Render stars for ratings
  const renderRatingStars = (rating) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill={star <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Booking Status Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex space-x-2 mb-2">
                <StatusBadge status={booking.status} />
                <PaymentStatusBadge paymentStatus={booking.paymentStatus} />
              </div>
              <h2 className="text-xl font-semibold">Booking #{bookingId.substring(0, 8)}...</h2>
            </div>
            
            {/* Admin Actions */}
            {isAdmin && booking.status === "confirmed" && (
  <div className="flex space-x-3">
    <button
      onClick={() => setShowReturnInspection(true)}
      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center"
    >
      <CheckCircle className="h-4 w-4 mr-1" />
      Process Return & Payment
    </button>
    
    <button
      onClick={() => handleUpdateStatus("cancelled")}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
    >
      <XCircle className="h-4 w-4 mr-1" />
      Cancel
    </button>
  </div>
)}
          </div>
        </div>

        {/* Booking Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer and Booking Info */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900">Booking Information</h3>
              
              {/* Customer Info */}
              <div className="mb-6">
  <div className="flex justify-between items-center mb-2">
    <h4 className="font-medium text-gray-800 flex items-center">
      <User className="h-4 w-4 mr-2 text-gray-500" />
      Customer
    </h4>
    {isAdmin && (
      <button
        onClick={() => setShowCustomerProfile(true)}
        className="text-sm text-primary hover:text-primary-600"
      >
        View Profile
      </button>
    )}
  </div>
  <div className="bg-gray-50 p-4 rounded-md">
    <p className="text-gray-800 font-medium">{booking.userName}</p>
    <p className="text-gray-600">{booking.userPhone}</p>
    
    {/* Add this to show user tags */}
    {userData && userData.tags && userData.tags.length > 0 && (
      <div className="mt-3">
        <div className="flex items-center mb-1">
          <TagIcon className="h-4 w-4 text-gray-500 mr-1" />
          <span className="text-sm text-gray-700">Tags</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {userData.tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
              
              {/* Booking Dates */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Booking Period
                </h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Time</p>
                      <p className="text-gray-800">{formatDate(booking.startTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Time</p>
                      <p className="text-gray-800">{formatDate(booking.endTime)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-gray-800">{formatDuration(booking.startTime, booking.endTime)}</p>
                    </div>
                    {booking.actualEndTime && (
                      <div>
                        <p className="text-sm text-gray-500">Actual End Time</p>
                        <p className="text-gray-800">{formatDate(booking.actualEndTime)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 flex items-center mb-2">
                  <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                  Payment Details
                </h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Price</p>
                      <p className="text-gray-800 font-medium">₹{booking.totalPrice}</p>
                    </div>
                    {booking.depositAmount && (
                      <div>
                        <p className="text-sm text-gray-500">Deposit Paid</p>
                        <p className="text-gray-800">₹{booking.depositAmount}</p>
                      </div>
                    )}
                    {booking.remainingAmount > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Remaining Amount</p>
                        <p className="text-gray-800">₹{booking.remainingAmount}</p>
                      </div>
                    )}
                    {booking.additionalCharges > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Additional Charges</p>
                        <p className="text-gray-800">₹{booking.additionalCharges}</p>
                      </div>
                    )}
                  </div>
                  
                  {booking.chargeReason && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-500">Reason for Additional Charges</p>
                      <p className="text-gray-700">{booking.chargeReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Vehicle and Inspection Info */}
            <div>
              {/* Vehicle Info */}
              <h3 className="text-lg font-medium mb-4 text-gray-900">Vehicle Information</h3>
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-4">
                    <div className="relative h-16 w-16 mr-4">
                      <Image
                        src={bike.imageUrl || "/placeholder-bike.jpg"}
                        alt={bike.name}
                        fill
                        className="object-cover rounded-md"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{bike.name}</p>
                      <p className="text-gray-600 text-sm">{bike.type}</p>
                      {bike.registrationNumber && (
                        <p className="text-gray-500 text-sm">Reg: {bike.registrationNumber}</p>
                      )}
                    </div>
                  </div>
                  
                  {bike.features && bike.features.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Features</p>
                      <div className="flex flex-wrap gap-1">
                        {bike.features.map((feature, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Inspection Info - Only show if inspection has been done */}
              {booking.inspectionTime && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-2 text-gray-500" />
                    Return Inspection
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 mb-3">
                      Inspected on {formatDate(booking.inspectionTime)}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Cleanliness</p>
                        {renderRatingStars(booking.cleanlinessRating)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Mechanical</p>
                        {renderRatingStars(booking.mechanicalRating)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fuel Level</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${booking.fuelLevel || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{booking.fuelLevel || 0}%</p>
                      </div>
                    </div>
                    
                    {booking.returnDamageFound && (
                      <div className="mt-3 bg-red-50 p-3 rounded border border-red-100">
                        <p className="text-sm font-medium text-red-700 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Damage Reported
                        </p>
                        <p className="text-sm mt-1">{booking.damageDescription}</p>
                        
                        {booking.damageImages && booking.damageImages.length > 0 && (
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {booking.damageImages.map((url, index) => (
                              <div key={index} className="relative">
                                <Image 
                                  src={url} 
                                  alt={`Damage ${index+1}`} 
                                  width={80}
                                  height={80}
                                  className="object-cover rounded"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {booking.returnInspectionNotes && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">Inspection Notes</p>
                        <p className="text-sm mt-1">{booking.returnInspectionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Return Inspection Modal */}
      {showReturnInspection && (
  <IntegratedReturnProcess
    bookingId={bookingId}
    adminId={user.id}
    onClose={() => setShowReturnInspection(false)}
  />
)}
      
      {/* Payment Collection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Collect Remaining Payment
            </h3>
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Payment Details</h4>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-blue-700">Total Price:</span>
                <span className="text-sm font-medium text-blue-900">₹{booking.totalPrice}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-blue-700">Deposit Paid:</span>
                <span className="text-sm font-medium text-blue-900">₹{booking.depositAmount || 0}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-blue-200 pt-2 mt-2">
                <span className="text-sm text-blue-800">Remaining Amount:</span>
                <span className="text-sm text-blue-900">₹{booking.remainingAmount || 0}</span>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="cash"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                    Cash
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="phonepe"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === "phonepe"}
                    onChange={() => setPaymentMethod("phonepe")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="phonepe" className="ml-3 block text-sm font-medium text-gray-700">
                    PhonePe (Direct)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="other"
                    name="paymentMethod"
                    type="radio"
                    checked={paymentMethod === "other"}
                    onChange={() => setPaymentMethod("other")}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="other" className="ml-3 block text-sm font-medium text-gray-700">
                    Other
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCompletePayment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Customer Profile Modal */}
      {showCustomerProfile && (
        <CustomerProfileModal
          userId={booking.userId}
          onClose={() => setShowCustomerProfile(false)}
        />
      )}
    </div>
  );
}