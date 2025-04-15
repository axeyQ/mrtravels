// src/components/dashboard/BikeDetailPage.jsx
"use client";  
import { useState, useEffect } from 'react';  
import { useQuery, useMutation } from 'convex/react';  
import { api } from '../../../convex/_generated/api';  
import { useUser } from '@clerk/nextjs';  
import { useRouter } from 'next/navigation';  
import { motion } from 'framer-motion';  
import { toast } from 'react-toastify';  
import Image from 'next/image';  
import TermsAndConditionsModal from '@/components/ui/TermsAndConditionsModal';  
import TimeLimitedDatePicker from '../ui/TimeLimitedDatePicker';  
import EndTimePicker from '../ui/EndTimePicker';  
import { Label } from '../ui/label';  
import { calculateRentalPrice, getPriceBreakdown } from '@/lib/PricingCalculator';  
import { ChevronDown, Check, X, Clock, AlertCircle } from 'lucide-react';
import { PAYMENT_CONFIG } from '@/config/paymentConfig';

export default function BikeDetailPage({ bikeId }) {  
  const router = useRouter();  
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();  
  const bike = useQuery(api.bikes.getBikeById, { bikeId });  
  const isLoading = bike === undefined;

  // Get current time and calculate time limit (30 minutes from now)  
  const currentTime = new Date();  
  const timeLimit = new Date(currentTime.getTime() + 30 * 60 * 1000);  
  const [startDate, setStartDate] = useState(currentTime);  
  const [endDate, setEndDate] = useState(new Date(currentTime.getTime() + 2 * 60 * 60 * 1000));  
  const [isBookingLoading, setIsBookingLoading] = useState(false);  
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);  
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);  
  const [showFeatures, setShowFeatures] = useState(false);  
  const [showPricing, setShowPricing] = useState(false);

  // Check if user profile is complete - only if user is signed in  
  const isProfileComplete = useQuery(  
    api.users.isProfileComplete,  
    isUserLoaded && isSignedIn ? { userId: user.id } : "skip"  
  );

  // Check if user already has an active booking  
  const hasActiveBooking = useQuery(  
    api.bookings.userHasActiveBooking,  
    isUserLoaded && isSignedIn ? { userId: user.id } : "skip"  
  );

  // Get availability information for the selected time period  
  const availabilityInfo = useQuery(  
    api.bookings.checkBikeAvailability,  
    {  
      bikeId,  
      startTime: startDate?.getTime() || Date.now(),  
      endTime: endDate?.getTime() || Date.now() + 2 * 60 * 60 * 1000  
    }  
  );

  // Check availability when date changes  
  useEffect(() => {  
    setIsCheckingAvailability(true);  
    // Availability will be automatically refetched when startDate or endDate changes  
    setTimeout(() => setIsCheckingAvailability(false), 500); // brief delay for UX  
  }, [startDate, endDate]);

  const createBooking = useMutation(api.bookings.createBooking);

  // Validate if selected start time is within 30 minutes from now  
  const isStartTimeValid = () => {  
    const now = new Date();  
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);  
    return startDate >= now && startDate <= thirtyMinutesFromNow;  
  };

  // Function to open terms modal  
  const handleOpenTermsModal = () => {  
    if (!isUserLoaded || !isSignedIn) {  
      toast.error("Please sign in to book a bike");  
      router.push('/sign-in');  
      return;  
    }

    // Check if profile is complete  
    if (isProfileComplete === false) {  
      toast.warning("Please complete your profile before booking");  
      router.push(`/profile?redirect=/bikes/${bikeId}`);  
      return;  
    }

    // Check if user already has an active booking  
    if (hasActiveBooking === true) {  
      toast.error("You already have an active booking. Please complete or cancel it before making a new booking.");  
      router.push('/bookings');  
      return;  
    }

    if (!bike.isAvailable) {  
      toast.error("This vehicle is not available for booking");  
      return;  
    }

    if (startDate >= endDate) {  
      toast.error("End time must be after start time");  
      return;  
    }

    // Check if the bike is available for the selected time period  
    if (availabilityInfo && !availabilityInfo.isAvailable) {  
      toast.error(availabilityInfo.reason || "This vehicle is already booked for the selected time period");  
      return;  
    }

    // If all validations pass, open the terms modal  
    setIsTermsModalOpen(true);  
  };

  // Proceed with booking after terms acceptance  
const handleBooking = async () => {
  setIsBookingLoading(true);
  try {
    // Get price information using our precise calculator
    const priceInfo = calculateRentalPrice(startDate, endDate, bike.pricePerHour);
    const totalPrice = priceInfo.price;

    // Get name from available sources
    const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown';

    // Create booking data
    const bookingData = {
      bikeId,
      userId: user.id,
      userName: fullName,
      userPhone: user.primaryPhoneNumber?.phoneNumber || "Not provided",
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      totalPrice,
      status: "pending"
    };
     
    console.log("Creating booking with data:", bookingData);
     
    // Call the createBooking mutation
    const bookingId = await createBooking(bookingData);
    toast.success("Booking created successfully!");
    
    // IMPORTANT: Add this redirect to the payment-upi page
    router.push(`/payment-upi?booking_id=${bookingId}`);
  } catch (error) {
    toast.error(`Booking failed: ${error.message || "Unknown error"}`);
    console.error("Booking error:", error);
  } finally {
    setIsBookingLoading(false);
  }
};

  if (isLoading) {  
    return <BikeDetailSkeleton />;  
  }

  // Determine if the bike is available based on admin settings and bookings  
  const isReallyAvailable = bike.isAvailable && (availabilityInfo?.isAvailable !== false);

  return (  
    <div className="container mx-auto px-4 py-4 sm:py-8">  
      <motion.div  
        initial={{ opacity: 0, x: -20 }}  
        animate={{ opacity: 1, x: 0 }}  
        className="rounded-lg overflow-hidden relative h-56 sm:h-80 mb-4 sm:mb-0"  
      >  
        <Image  
          src={bike.imageUrl || '/placeholder-bike.jpg'}  
          alt={bike.name}  
          fill  
          className="object-cover"  
          sizes="(max-width: 640px) 100vw, 50vw"  
        />  
        {/* Availability tag */}  
        {!bike.isAvailable && (  
          <div className="absolute top-4 left-0 bg-red-600 text-white px-4 py-1 rounded-r-full font-medium">  
            Currently Unavailable  
          </div>  
        )}  
        {/* Booking status tag */}  
        {bike.isAvailable && !isReallyAvailable && (  
          <div className="absolute top-4 left-0 bg-orange-600 text-white px-4 py-1 rounded-r-full font-medium">  
            Booked for Selected Time  
          </div>  
        )}  
      </motion.div>

      <div className="sm:grid sm:grid-cols-1 md:grid-cols-2 gap-8">  
        <motion.div  
          initial={{ opacity: 0, y: 10 }}  
          animate={{ opacity: 1, y: 0 }}  
        >  
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{bike.name}</h1>  
          <div className="flex items-center mt-2 space-x-2">  
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs sm:text-sm font-medium text-blue-700">  
              {bike.type}  
            </span>  
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs sm:text-sm font-medium  
              ${isReallyAvailable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>  
              {isReallyAvailable ? "Available" : "Unavailable"}  
            </span>  
          </div>  
           
          {/* Mobile-optimized collapsible sections */}  
          {bike.description !== "" ? (  
            <div className="mt-4 border-t border-b py-3">  
              <button  
                onClick={() => setShowFeatures(!showFeatures)}  
                className="w-full flex justify-between items-center text-left"  
              >  
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>  
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showFeatures ? 'rotate-180' : ''}`} />  
              </button>  
              {showFeatures && (  
                <p className="mt-2 text-gray-600 text-sm">{bike.description || "No description available"}</p>  
              )}  
            </div>  
          ) : null}  
           
          {bike.features && bike.features.length !== 0 ? (  
            <div className="border-b py-3">  
              <button  
                onClick={() => setShowFeatures(!showFeatures)}  
                className="w-full flex justify-between items-center text-left"  
              >  
                <h2 className="text-lg font-semibold text-gray-900">Features</h2>  
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showFeatures ? 'rotate-180' : ''}`} />  
              </button>  
              {showFeatures && (  
                <div className="mt-2">  
                  {bike.features && bike.features.length > 0 ? (  
                    <ul className="grid grid-cols-2 gap-2">  
                      {bike.features.map((feature, index) => (  
                        <li key={index} className="flex items-center text-sm text-gray-600">  
                          <Check className="w-4 h-4 mr-2 text-primary" />  
                          {feature}  
                        </li>  
                      ))}  
                    </ul>  
                  ) : (  
                    <p className="mt-2 text-gray-500">No features available</p>  
                  )}  
                </div>  
              )}  
            </div>  
          ) : null}  
           
          <div className="py-3">  
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Booking</h2>  
            {bike.isAvailable ? (  
              <div className="mt-2">  
                {/* Sign in prompt for non-signed in users */}  
                {!isSignedIn && (  
                  <div className="bg-blue-50 p-4 rounded-md mb-4">  
                    <h3 className="font-medium text-blue-800">Sign in Required</h3>  
                    <p className="text-blue-700 mt-1">  
                      You need to sign in to book this bike.  
                    </p>  
                    <button  
                      onClick={() => router.push(`/sign-in?redirect=/bikes/${bikeId}`)}  
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"  
                    >  
                      Sign In to Book  
                    </button>  
                  </div>  
                )}

                {/* Profile Completion Warning */}  
                {isSignedIn && isProfileComplete === false && (  
                  <div className="bg-yellow-50 p-4 rounded-md mb-4">  
                    <h3 className="font-medium text-yellow-800">Profile Incomplete</h3>  
                    <p className="text-yellow-700 mt-1">  
                      You need to complete your profile before booking.  
                      <button  
                        onClick={() => router.push(`/profile?redirect=/bikes/${bikeId}`)}  
                        className="ml-2 text-yellow-800 font-medium underline"  
                      >  
                        Complete Profile  
                      </button>  
                    </p>  
                  </div>  
                )}  
                 
                {/* Active Booking Warning */}  
                {isSignedIn && hasActiveBooking === true && (  
                  <div className="bg-red-50 p-4 rounded-md mb-4">  
                    <h3 className="font-medium text-red-800">Active Booking Exists</h3>  
                    <div className="flex items-start mt-1">  
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />  
                      <p className="text-red-700">  
                        You already have an active booking. You can only have one booking at a time.  
                        <button  
                          onClick={() => router.push('/bookings')}  
                          className="ml-2 text-red-800 font-medium underline"  
                        >  
                          View My Bookings  
                        </button>  
                      </p>  
                    </div>  
                  </div>  
                )}  
                 
                {/* Only show booking options if user is signed in, has a complete profile, and doesn't have an active booking */}  
                {isSignedIn && isProfileComplete === true && hasActiveBooking !== true && (  
                  <>  
                    {/* Booking information box */}  
                    <div className="bg-blue-50 p-4 rounded-md mb-4">  
                      <h3 className="font-medium text-blue-800">Booking Information</h3>  
                      <p className="text-blue-700 mt-1 text-sm">  
                        Pay only ₹{PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT} deposit now. Remaining balance will be paid after return.  
                      </p>  
                      <p className="text-blue-700 mt-1 text-sm">  
                        <strong>Note:</strong> You can only book for start times within the next 30 minutes.  
                      </p>  
                    </div>

                    {/* Mobile-optimized time pickers */}  
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">  
                      <TimeLimitedDatePicker  
                        selectedDate={startDate}  
                        onChange={(date) => {  
                          setStartDate(date);  
                          // Ensure end date is at least 30 minutes after start date  
                          if (endDate < new Date(date.getTime() + 30 * 60 * 1000)) {  
                            setEndDate(new Date(date.getTime() + 30 * 60 * 1000));  
                          }  
                        }}  
                        label="Start Time"  
                        error={!isStartTimeValid() ? "Start time must be within the next 30 minutes" : null}  
                      />  
                      <EndTimePicker  
                        selectedDate={endDate}  
                        onChange={(date) => setEndDate(date)}  
                        startTime={startDate}  
                        label="End Time"  
                      />  
                    </div>

                    {/* Availability indicator */}  
                    {isCheckingAvailability ? (  
                      <div className="bg-blue-50 p-3 rounded-md mb-4 animate-pulse flex items-center">  
                        <Clock className="h-4 w-4 mr-2 text-blue-500 animate-spin" />  
                        <p className="text-blue-800 text-sm">Checking availability...</p>  
                      </div>  
                    ) : !isReallyAvailable ? (  
                      <div className="bg-red-50 p-3 rounded-md mb-4 flex items-center">  
                        <X className="h-4 w-4 mr-2 text-red-500" />  
                        <p className="text-red-800 font-medium text-sm">  
                          {!bike.isAvailable  
                            ? "This bike is not available for booking."  
                            : availabilityInfo?.reason || "This bike is already booked for the selected time period"  
                          }  
                        </p>  
                      </div>  
                    ) : (  
                      <div className="bg-green-50 p-3 rounded-md mb-4 flex items-center">  
                        <Check className="h-4 w-4 mr-2 text-green-500" />  
                        <p className="text-green-800 font-medium text-sm">  
                          This bike is available for booking during the selected time period!  
                        </p>  
                      </div>  
                    )}

                    {/* Price breakdown with toggle for mobile */}  
                    <div className="border-t border-gray-200 pt-4 mb-4">  
                      <button  
                        onClick={() => setShowPricing(!showPricing)}  
                        className="w-full flex justify-between items-center text-left mb-2"  
                      >  
                        <h3 className="font-medium text-gray-800">Price Breakdown</h3>  
                        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showPricing ? 'rotate-180' : ''}`} />  
                      </button>  
                       
                      {showPricing && startDate && endDate && bike ? (  
                        <div className="bg-gray-50 p-4 rounded-md">  
                          {(() => {  
                            const priceInfo = calculateRentalPrice(startDate, endDate, bike.pricePerHour);  
                            const breakdown = getPriceBreakdown(startDate, endDate, bike.pricePerHour);  
                             
                            return (  
                              <>  
                                {/* Duration information */}  
                                <div className="flex justify-between text-sm mb-1">  
                                  <span className="text-gray-600">Duration:</span>  
                                  <span className="font-medium">{priceInfo.formattedDuration}</span>  
                                </div>  
                                 
                                {/* Breakdown of the price components */}  
                                {breakdown.map((item, index) => (  
                                  <div key={index} className="flex justify-between text-sm mb-1">  
                                    <span className="text-gray-600">  
                                      {item.description} ({item.rate}):  
                                    </span>  
                                    <span className="font-medium">₹{item.amount}</span>  
                                  </div>  
                                ))}  
                                 
                                {/* Total price */}  
                                <div className="flex justify-between mt-1 text-lg font-semibold border-t border-gray-200 pt-2">  
                                  <span>Estimated total:</span>  
                                  <span className="text-primary">₹{priceInfo.price}</span>  
                                </div>  
                                 
                                {/* Deposit information */}  
                                <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">  
                                  <span className="text-gray-800 font-medium">Deposit to pay now:</span>  
                                  <span className="text-green-600 font-bold">₹{PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT}</span>  
                                </div>  
                                 
                                <div className="flex justify-between mt-1">  
                                  <span className="text-gray-600">To pay after return:</span>  
                                  <span className="font-medium">₹{Math.max(0, priceInfo.price - PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT)}</span>  
                                </div>  
                                 
                                <div className="mt-2 text-xs text-gray-500">  
                                  * ₹40 from deposit goes to bike owner, ₹2 is platform fee  
                                </div>  
                              </>  
                            );  
                          })()}  
                        </div>  
                      ) : (  
                        !showPricing && (  
                          <div className="flex justify-between text-sm mb-3 px-1">  
                            <span className="text-gray-600">Deposit:</span>  
                            <span className="font-bold">₹{PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT}</span>  
                          </div>  
                        )  
                      )}  
                    </div>  
                  </>  
                )}

                {/* Booking button - different states based on user status */}  
                {!isSignedIn ? (  
                  <button  
                    onClick={() => router.push(`/sign-in?redirect=/bikes/${bikeId}`)}  
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"  
                  >  
                    Sign In to Book  
                  </button>  
                ) : isProfileComplete === false ? (  
                  <button  
                    onClick={() => router.push(`/profile?redirect=/bikes/${bikeId}`)}  
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"  
                  >  
                    Complete Profile to Book  
                  </button>  
                ) : hasActiveBooking === true ? (  
                  <button  
                    onClick={() => router.push('/bookings')}  
                    className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  
                  >  
                    View My Active Booking  
                  </button>  
                ) : (  
                  <button  
                    onClick={handleOpenTermsModal}  
                    disabled={isBookingLoading || !isReallyAvailable || !isStartTimeValid()}  
                    className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white  
                      ${isReallyAvailable && isStartTimeValid()  
                        ? 'bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'  
                        : 'bg-gray-400 cursor-not-allowed'}`}  
                  >  
                    {isBookingLoading  
                      ? "Processing..."  
                      : isReallyAvailable && isStartTimeValid()  
                        ? `Book & Pay ₹${PAYMENT_CONFIG.UPI.DEPOSIT_AMOUNT} Deposit`  
                        : "Unavailable"  
                    }  
                  </button>  
                )}  
              </div>  
            ) : (  
              <p className="mt-2 text-red-600">This vehicle is currently not available for booking.</p>  
            )}  
          </div>  
        </motion.div>  
      </div>  
      {/* Terms and Conditions Modal */}  
      <TermsAndConditionsModal  
        isOpen={isTermsModalOpen}  
        onClose={() => setIsTermsModalOpen(false)}  
        onAccept={() => {  
          setIsTermsModalOpen(false);  
          handleBooking();  
        }}  
      />  
    </div>  
  );  
}

function BikeDetailSkeleton() {  
  return (  
    <div className="container mx-auto px-4 py-8">  
      <div className="mb-8 rounded-lg overflow-hidden bg-gray-200 animate-pulse h-56 sm:h-80"></div>  
      <div>  
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-3/4"></div>  
        <div className="flex space-x-2 mb-4">  
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>  
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>  
        </div>  
        <div className="mb-4">  
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>  
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>  
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>  
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>  
        </div>  
        <div className="mb-4">  
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>  
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-2"></div>  
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-4"></div>  
          <div className="h-24 bg-gray-200 rounded animate-pulse mb-4"></div>  
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>  
        </div>  
      </div>  
    </div>  
  );  
}