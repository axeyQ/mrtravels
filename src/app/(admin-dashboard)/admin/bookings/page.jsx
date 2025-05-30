// src/app/(admin-dashboard)/admin/bookings/page.js

"use client";  
import { useQuery, useMutation } from "convex/react";  
import { api } from "../../../../../convex/_generated/api";  
import { useUser } from "@clerk/nextjs";  
import { useState, useMemo } from "react";  
import { toast } from "react-toastify";  
import { BiCheck, BiX, BiCalendar, BiMoney, BiUser, BiDetail } from "react-icons/bi";  
import { CheckCircle, DollarSign } from 'lucide-react';  
import Link from "next/link";  
import Image from "next/image";  
import { useRouter } from "next/navigation";  
import CustomerProfileModal from "@/components/admin/CustomerProfileModal";  
import AdminCustomBookingModal from "@/components/admin/AdminCustomBookingModal";  
import IntegratedReturnProcess from '@/components/admin/IntegratedReturnProcess';  
import ResponsiveTable from "@/components/admin/ResponsiveTable";  
import BookingFilters from "@/components/admin/BookingFilters";
import UpiVerificationPanel from '@/components/admin/UpiVerificationPanel';

export default function AdminBookings() {  
  const router = useRouter();  
  const { user, isLoaded: isUserLoaded } = useUser();  
   
  // Fetch all bookings  
  const bookings = useQuery(  
    api.bookings.getAllBookings,  
    isUserLoaded && user ? { adminId: user.id } : null  
  ) || [];  
   
  // Fetch all bikes to get their names  
  const bikes = useQuery(api.bikes.getAllBikes) || [];  
   
  // Fetch all users to get profile information  
  const users = useQuery(  
    api.users.listUsers,  
    isUserLoaded && user ? { adminId: user.id } : null  
  ) || [];  
   
  const isLoading = !isUserLoaded || bookings === undefined || bikes === undefined || users === undefined;  
   
  // State for modals and selections  
  const [selectedBooking, setSelectedBooking] = useState(null);  
  const [statusToUpdate, setStatusToUpdate] = useState("");  
  const [showPaymentModal, setShowPaymentModal] = useState(false);  
  const [paymentMethod, setPaymentMethod] = useState("cash");  
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);  
  const [showCustomBookingModal, setShowCustomBookingModal] = useState(false);  
   
  // Vehicle return inspection state  
  const [showReturnInspection, setShowReturnInspection] = useState(false);  
  const [bookingForInspection, setBookingForInspection] = useState(null);  
   
  // Filter state  
  const [filters, setFilters] = useState({  
    status: "",  
    dateFrom: null,  
    dateTo: null,  
    customerName: "",  
    bikeId: "",  
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState("bookings");
   
  const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);  
  const completePayment = useMutation(api.bookings.completePayment);

  // Create a map of bike IDs to bike objects  
  const bikeMap = bikes.reduce((map, bike) => {  
    map[bike._id] = bike;  
    return map;  
  }, {});  
   
  // Create a map of user IDs to user data  
  const userMap = users.reduce((map, userData) => {  
    map[userData.userId] = userData;  
    return map;  
  }, {});

  // Handle updating booking status  
  const handleUpdateStatus = async () => {  
    if (!isUserLoaded || !user || !selectedBooking || !statusToUpdate) return;  
    try {  
      await updateBookingStatus({  
        bookingId: selectedBooking._id,  
        status: statusToUpdate,  
        userId: user.id,  
      });  
      toast.success(`Booking ${statusToUpdate} successfully`);  
      setSelectedBooking(null);  
      setStatusToUpdate("");  
    } catch (error) {  
      console.error("Error updating booking status:", error);  
      toast.error(error.message || "Failed to update booking status");  
    }  
  };

  // Handle completing payment  
  const handleCompletePayment = async () => {  
    if (!isUserLoaded || !user || !selectedBooking) return;  
    try {  
      await completePayment({  
        bookingId: selectedBooking._id,  
        adminId: user.id,  
        paymentMethod,  
      });  
      toast.success("Payment completed successfully");  
      setShowPaymentModal(false);  
      setSelectedBooking(null);  
    } catch (error) {  
      console.error("Error completing payment:", error);  
      toast.error(error.message || "Failed to complete payment");  
    }  
  };

  // Function to show the customer profile modal  
  const handleViewCustomerProfile = (userId) => {  
    setSelectedCustomerId(userId);  
  };

  // Status badge component  
  const StatusBadge = ({ status }) => {  
    let colorClass = "";  
    switch (status) {  
      case "pending":  
        colorClass = "bg-yellow-100 text-yellow-800";  
        break;  
      case "confirmed":  
        colorClass = "bg-green-100 text-green-800";  
        break;  
      case "cancelled":  
        colorClass = "bg-red-100 text-red-800";  
        break;  
      case "completed":  
        colorClass = "bg-blue-100 text-blue-800";  
        break;  
      default:  
        colorClass = "bg-gray-100 text-gray-800";  
    }  
    return (  
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>  
        {status}  
      </span>  
    );  
  };

  // Payment status badge component  
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
      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>  
        {label}  
      </span>  
    );  
  };

  // Filter bookings based on applied filters  
  const filteredBookings = useMemo(() => {  
    if (!bookings.length) return [];  
     
    return bookings.filter(booking => {  
      // Status filter  
      if (filters.status && booking.status !== filters.status) {  
        return false;  
      }  
       
      // Date range filter - check if booking dates overlap with filtered range  
      if (filters.dateFrom && new Date(booking.endTime) < filters.dateFrom) {  
        return false;  
      }  
       
      if (filters.dateTo) {  
        const filterEndDate = new Date(filters.dateTo);  
        filterEndDate.setHours(23, 59, 59, 999); // End of the selected day  
        if (new Date(booking.startTime) > filterEndDate) {  
          return false;  
        }  
      }  
       
      // Customer name filter (case insensitive)  
      if (filters.customerName && !booking.userName.toLowerCase().includes(filters.customerName.toLowerCase())) {  
        return false;  
      }  
       
      // Bike filter  
      if (filters.bikeId && booking.bikeId !== filters.bikeId) {  
        return false;  
      }  
       
      return true; // If all filters pass  
    });  
  }, [bookings, filters]);  
   
  // Sort filtered bookings by start time (newest first)  
  const sortedBookings = useMemo(() => {  
    return [...filteredBookings].sort((a, b) => b.startTime - a.startTime);  
  }, [filteredBookings]);

  // Clear all filters  
  const clearFilters = () => {  
    setFilters({  
      status: "",  
      dateFrom: null,  
      dateTo: null,  
      customerName: "",  
      bikeId: "",  
    });  
  };

  // Apply filters  
  const applyFilters = (newFilters) => {  
    setFilters(newFilters);  
  };  
   
  // Table headers for desktop view  
  const headers = ["Customer", "Bike", "Booking Period", "Payment", "Status", "Actions"];  
   
  // Render function for desktop table rows  
  const renderRow = (booking) => {  
    const bike = bikeMap[booking.bikeId];  
    const customerData = userMap[booking.userId] || null;  
    return (  
      <tr key={booking._id}>  
        <td className="px-6 py-4 whitespace-nowrap">  
          <div className="flex items-center">  
            <div className="flex-shrink-0 h-10 w-10 relative rounded-full overflow-hidden bg-gray-200">  
              {customerData && customerData.profilePictureUrl ? (  
                <Image  
                  src={customerData.profilePictureUrl}  
                  alt={`${booking.userName} profile`}  
                  fill  
                  className="object-cover"  
                  sizes="40px"  
                />  
              ) : customerData && customerData.imageUrl ? (  
                <Image  
                  src={customerData.imageUrl}  
                  alt={`${booking.userName} profile`}  
                  fill  
                  className="object-cover"  
                  sizes="40px"  
                />  
              ) : (  
                <div className="h-10 w-10 flex items-center justify-center">  
                  <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">  
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />  
                  </svg>  
                </div>  
              )}  
            </div>  
            <div className="ml-4">  
              <div className="flex items-center">  
                <div className="text-sm font-medium text-gray-900">{booking.userName}</div>  
                <button  
                  onClick={() => handleViewCustomerProfile(booking.userId)}  
                  className="ml-2 text-blue-600 hover:text-blue-800"  
                  title="View customer profile"  
                >  
                  <BiUser className="h-4 w-4" />  
                </button>  
              </div>  
              <div className="text-sm text-gray-500">{booking.userPhone}</div>  
              {customerData && customerData.tags && customerData.tags.length > 0 && (  
                <div className="flex flex-wrap gap-1 mt-1">  
                  {customerData.tags.slice(0, 2).map((tag, index) => (  
                    <span  
                      key={index}  
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"  
                    >  
                      {tag}  
                    </span>  
                  ))}  
                  {customerData.tags.length > 2 && (  
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">  
                      +{customerData.tags.length - 2}  
                    </span>  
                  )}  
                </div>  
              )}  
            </div>  
          </div>  
        </td>  
        <td className="px-6 py-4 whitespace-nowrap">  
          <div className="flex items-center">  
            {bike && (  
              <>  
                <div className="h-8 w-8 flex-shrink-0 relative">  
                  <Image  
                    src={bike.imageUrl || "/placeholder-bike.jpg"}  
                    alt={bike.name}  
                    className="rounded-full object-cover"  
                    fill  
                    sizes="32px"  
                  />  
                </div>  
                <div className="ml-3">  
                  <div className="text-sm font-medium text-gray-900">{bike.registrationNumber || bike.name}</div>  
                  <div className="text-sm text-gray-500">{bike.type}</div>  
                </div>  
              </>  
            )}  
          </div>  
        </td>  
        <td className="px-6 py-4 whitespace-nowrap">  
          <div className="text-sm text-gray-900">  
            {new Date(booking.startTime).toLocaleDateString()}  
          </div>  
          <div className="text-sm text-gray-500">  
            {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}  
          </div>  
        </td>  
        <td className="px-6 py-4 whitespace-nowrap">  
          <div className="text-sm text-gray-900">₹{booking.totalPrice}</div>  
          {booking.depositAmount && (  
            <div className="text-xs text-gray-500">  
              Deposit: ₹{booking.depositAmount}  
              {booking.remainingAmount > 0 && (  
                <span className="ml-1">| Due: ₹{booking.remainingAmount}</span>  
              )}  
            </div>  
          )}  
        </td>  
        <td className="px-6 py-4 whitespace-nowrap">  
          <div className="flex">  
            <StatusBadge status={booking.status} />  
            <PaymentStatusBadge paymentStatus={booking.paymentStatus} />  
          </div>  
        </td>  
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">  
          {/* Different action buttons based on booking state */}  
          <div className="flex space-x-2">  
            {/* View details button - always shown */}  
            <button  
              onClick={() => router.push(`/admin/bookings/${booking._id}`)}  
              className="text-primary hover:text-primary-600"  
              title="View details"  
            >  
              <BiDetail className="h-5 w-5" />  
            </button>  
             
            {booking.status === "pending" && (  
              <>  
                <button  
                  onClick={() => {  
                    setSelectedBooking(booking);  
                    setStatusToUpdate("confirmed");  
                  }}  
                  className="text-green-600 hover:text-green-800"  
                  title="Confirm booking"  
                >  
                  <BiCheck className="h-5 w-5" />  
                </button>  
                <button  
                  onClick={() => {  
                    setSelectedBooking(booking);  
                    setStatusToUpdate("cancelled");  
                  }}  
                  className="text-red-600 hover:text-red-800"  
                  title="Cancel booking"  
                >  
                  <BiX className="h-5 w-5" />  
                </button>  
              </>  
            )}  
             
            {booking.status === "confirmed" && (  
              <>  
                {/* Process Return & Payment button - single unified action */}  
                <button  
                  onClick={() => {  
                    setBookingForInspection(booking);  
                    setShowReturnInspection(true);  
                  }}  
                  className="text-green-600 hover:text-green-800"  
                  title="Process Return & Payment"  
                >  
                  <CheckCircle className="h-5 w-5" />  
                </button>  
                 
                {/* Cancel button - still needed */}  
                <button  
                  onClick={() => {  
                    setSelectedBooking(booking);  
                    setStatusToUpdate("cancelled");  
                  }}  
                  className="text-red-600 hover:text-red-800"  
                  title="Cancel booking"  
                >  
                  <BiX className="h-5 w-5" />  
                </button>  
              </>  
            )}  
          </div>  
        </td>  
      </tr>  
    );  
  };  
   
  // Render function for mobile cards  
  const renderMobileCard = (booking) => {  
    const bike = bikeMap[booking.bikeId];  
    const customerData = userMap[booking.userId] || null;  
    return (  
      <div key={booking._id} className="bg-white rounded-lg shadow mb-4 overflow-hidden">  
        {/* Customer and Bike Info */}  
        <div className="p-4 border-b border-gray-200">  
          <div className="flex items-center justify-between">  
            <div className="flex items-center">  
              <div className="flex-shrink-0 h-10 w-10 relative rounded-full overflow-hidden bg-gray-200 mr-3">  
                {customerData && customerData.profilePictureUrl ? (  
                  <Image  
                    src={customerData.profilePictureUrl}  
                    alt={`${booking.userName} profile`}  
                    fill  
                    className="object-cover"  
                    sizes="40px"  
                  />  
                ) : customerData && customerData.imageUrl ? (  
                  <Image  
                    src={customerData.imageUrl}  
                    alt={`${booking.userName} profile`}  
                    fill  
                    className="object-cover"  
                    sizes="40px"  
                  />  
                ) : (  
                  <div className="h-10 w-10 flex items-center justify-center">  
                    <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">  
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />  
                    </svg>  
                  </div>  
                )}  
              </div>  
              <div>  
                <div className="flex items-center">  
                  <div className="text-sm font-medium text-gray-900">{booking.userName}</div>  
                  <button  
                    onClick={() => handleViewCustomerProfile(booking.userId)}  
                    className="ml-2 text-blue-600 hover:text-blue-800"  
                    title="View customer profile"  
                  >  
                    <BiUser className="h-4 w-4" />  
                  </button>  
                </div>  
                <div className="text-xs text-gray-500">{booking.userPhone}</div>  
                {customerData && customerData.tags && customerData.tags.length > 0 && (  
                  <div className="flex flex-wrap gap-1 mt-1">  
                    {customerData.tags.length > 0 && (  
                      <span  
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"  
                      >  
                        {customerData.tags[0]}  
                      </span>  
                    )}  
                    {customerData.tags.length > 1 && (  
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">  
                        +{customerData.tags.length - 1}  
                      </span>  
                    )}  
                  </div>  
                )}  
              </div>  
            </div>  
            <div className="flex">  
              <StatusBadge status={booking.status} />  
              <PaymentStatusBadge paymentStatus={booking.paymentStatus} />  
            </div>  
          </div>  
        </div>  
         
        {/* Booking Details */}  
        <div className="p-4">  
          {/* Bike Info */}  
          <div className="flex items-center mb-2">  
            {bike && (  
              <>  
                <div className="h-6 w-6 flex-shrink-0 relative mr-2">  
                  <Image  
                    src={bike.imageUrl || "/placeholder-bike.jpg"}  
                    alt={bike.name}  
                    className="rounded-full object-cover"  
                    fill  
                    sizes="24px"  
                  />  
                </div>  
                <div className="text-xs font-medium text-gray-900">{bike.registrationNumber || bike.name}</div>  
              </>  
            )}  
          </div>  
           
          {/* Booking Period */}  
          <div className="text-xs text-gray-700 mb-2">  
            <span className="font-medium">Period:</span> {new Date(booking.startTime).toLocaleDateString()}{' '}  
            {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}  
          </div>  
           
          {/* Payment Info */}  
          <div className="text-xs text-gray-700 mb-3">  
            <span className="font-medium">Payment:</span> ₹{booking.totalPrice}  
            {booking.depositAmount && (  
              <span className="block mt-1 text-xs text-gray-500">  
                Deposit: ₹{booking.depositAmount}  
                {booking.remainingAmount > 0 && (  
                  <span className="ml-1">| Due: ₹{booking.remainingAmount}</span>  
                )}  
              </span>  
            )}  
          </div>  
           
          {/* Action Buttons */}  
          <div className="flex justify-end space-x-2 mt-2">  
            {/* View details button - always shown */}  
            <button  
              onClick={() => router.push(`/admin/bookings/${booking._id}`)}  
              className="p-2 text-primary hover:text-primary-dark hover:bg-primary-50 rounded-full"  
              title="View details"  
            >  
              <BiDetail className="h-5 w-5" />  
            </button>  
             
            {/* Different action buttons based on booking state */}  
            {booking.status === "pending" && (  
              <>  
                <button  
                  onClick={() => {  
                    setSelectedBooking(booking);  
                    setStatusToUpdate("confirmed");  
                  }}  
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full"  
                  title="Confirm booking"  
                >  
                  <BiCheck className="h-5 w-5" />  
                </button>  
                <button  
                  onClick={() => {  
                    setSelectedBooking(booking);  
                    setStatusToUpdate("cancelled");  
                  }}  
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"  
                  title="Cancel booking"  
                >  
                  <BiX className="h-5 w-5" />  
                </button>  
              </>  
            )}  
             
            {booking.status === "confirmed" && (  
              <>  
                {/* Process Return & Payment button - single unified action */}  
                <button  
                  onClick={() => {  
                    setBookingForInspection(booking);  
                    setShowReturnInspection(true);  
                  }}  
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full"  
                  title="Process Return & Payment"  
                >  
                  <CheckCircle className="h-5 w-5" />  
                </button>  
                 
                {/* Cancel button - still needed */}  
                <button  
                  onClick={() => {  
                    setSelectedBooking(booking);  
                    setStatusToUpdate("cancelled");  
                  }}  
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"  
                  title="Cancel booking"  
                >  
                  <BiX className="h-5 w-5" />  
                </button>  
              </>  
            )}  
          </div>  
        </div>  
      </div>  
    );  
  };

  return (  
    <div>  
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">  
        <h1 className="text-2xl font-bold">Manage Bookings</h1>  
        <button  
          onClick={() => setShowCustomBookingModal(true)}  
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600"  
        >  
          <svg  
            className="mr-2 h-5 w-5"  
            fill="none"  
            viewBox="0 0 24 24"  
            stroke="currentColor"  
          >  
            <path  
              strokeLinecap="round"  
              strokeLinejoin="round"  
              strokeWidth={2}  
              d="M12 4v16m8-8H4"  
            />  
          </svg>  
          Create Custom Booking  
        </button>  
      </div>  
       
      {/* Tabs for different sections */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`${
                activeTab === "bookings"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Bookings
            </button>
            <button
              onClick={() => setActiveTab("upi_verification")}
              className={`${
                activeTab === "upi_verification"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              UPI Verification
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "bookings" ? (
        <>
          {/* Booking Filters Component */}  
          <BookingFilters  
            filters={filters}  
            setFilters={setFilters}  
            bikes={bikes}  
            clearFilters={clearFilters}  
            applyFilters={applyFilters}  
          />  
           
          {showCustomBookingModal && (  
            <AdminCustomBookingModal  
              onClose={() => setShowCustomBookingModal(false)}  
              adminId={user.id}  
            />  
          )}  
           
          {/* Booking count summary when filters are applied */}  
          {Object.values(filters).some(v => v !== "" && v !== null) && (  
            <div className="mb-4">  
              <p className="text-sm text-gray-600">  
                Showing {sortedBookings.length} of {bookings.length} bookings  
                {filters.status && <span> with status <strong>{filters.status}</strong></span>}  
              </p>  
            </div>  
          )}  
           
          {sortedBookings.length === 0 && !isLoading ? (  
            <div className="bg-white rounded-lg shadow p-6 text-center">  
              <p className="text-gray-500">No bookings found</p>  
            </div>  
          ) : (  
            <ResponsiveTable  
              headers={headers}  
              data={sortedBookings}  
              renderRow={renderRow}  
              renderMobileCard={renderMobileCard}  
              isLoading={isLoading}  
              emptyMessage="No bookings found"  
            />  
          )}
        </>
      ) : (
        <UpiVerificationPanel adminId={user.id} />
      )}
       
      {/* Status Update Confirmation Modal */}  
      {selectedBooking && statusToUpdate && !showPaymentModal && (  
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">  
          <div className="bg-white rounded-lg max-w-md w-full p-6">  
            <h3 className="text-lg font-medium text-gray-900 mb-4">  
              Confirm Status Update  
            </h3>  
            <p className="text-gray-500 mb-6">  
              Are you sure you want to mark this booking as {statusToUpdate}?  
            </p>  
            <div className="flex justify-end space-x-4">  
              <button  
                onClick={() => {  
                  setSelectedBooking(null);  
                  setStatusToUpdate("");  
                }}  
                className="px-4 py-2 text-gray-700 hover:text-gray-800"  
              >  
                Cancel  
              </button>  
              <button  
                onClick={handleUpdateStatus}  
                className={`px-4 py-2 text-white rounded-md ${  
                  statusToUpdate === "confirmed" ? "bg-green-600 hover:bg-green-700" :  
                  statusToUpdate === "cancelled" ? "bg-red-600 hover:bg-red-700" :  
                  "bg-blue-600 hover:bg-blue-700"  
                }`}  
              >  
                Confirm  
              </button>  
            </div>  
          </div>  
        </div>  
      )}  
       
      {/* Payment Collection Modal */}  
      {showPaymentModal && selectedBooking && (  
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">  
          <div className="bg-white rounded-lg max-w-md w-full p-6">  
            <h3 className="text-lg font-medium text-gray-900 mb-4">  
              Collect Remaining Payment  
            </h3>  
            <div className="bg-blue-50 p-4 rounded-md mb-6">  
              <h4 className="text-sm font-medium text-blue-800 mb-2">Payment Details</h4>  
              <div className="flex justify-between mb-1">  
                <span className="text-sm text-blue-700">Total Price:</span>  
                <span className="text-sm font-medium text-blue-900">₹{selectedBooking.totalPrice}</span>  
              </div>  
              <div className="flex justify-between mb-1">  
                <span className="text-sm text-blue-700">Deposit Paid:</span>  
                <span className="text-sm font-medium text-blue-900">₹{selectedBooking.depositAmount || 0}</span>  
              </div>  
              <div className="flex justify-between font-bold border-t border-blue-200 pt-2 mt-2">  
                <span className="text-sm text-blue-800">Remaining Amount:</span>  
                <span className="text-sm text-blue-900">₹{selectedBooking.remainingAmount || 0}</span>  
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
                onClick={() => {  
                  setShowPaymentModal(false);  
                  setSelectedBooking(null);  
                }}  
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
      {selectedCustomerId && (  
        <CustomerProfileModal  
          userId={selectedCustomerId}  
          onClose={() => setSelectedCustomerId(null)}  
        />  
      )}  
       
      {/* Integrated Return Process Modal */}  
      {showReturnInspection && bookingForInspection && (  
        <IntegratedReturnProcess  
          bookingId={bookingForInspection._id}  
          adminId={user.id}  
          onClose={() => {  
            setShowReturnInspection(false);  
            setBookingForInspection(null);  
          }}  
        />  
      )}  
    </div>  
  );  
}