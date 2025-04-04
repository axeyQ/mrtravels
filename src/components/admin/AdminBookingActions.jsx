import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

/**
 * Admin Booking Actions Component
 * Provides admin UI for managing early returns and booking extensions
 */
export default function AdminBookingActions({ booking, bike, onActionComplete }) {
  const { user } = useUser();
  
  // States for modals
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEarlyReturnModal, setShowEarlyReturnModal] = useState(false);
  
  // Date states
  const [extendEndDate, setExtendEndDate] = useState(new Date(booking.endTime + 60 * 60 * 1000)); // Default to 1 hour later
  const [earlyReturnDate, setEarlyReturnDate] = useState(new Date());
  
  // Additional admin options
  const [adminNotes, setAdminNotes] = useState('');
  const [adjustPriceByPercentage, setAdjustPriceByPercentage] = useState(0);
  
  // Loading states
  const [isExtending, setIsExtending] = useState(false);
  const [isReturningEarly, setIsReturningEarly] = useState(false);
  
  // Convex mutations
  const extendBooking = useMutation(api.bookings.extendBooking);
  const processEarlyReturn = useMutation(api.bookings.processEarlyReturn);
  
  // Handle extending a booking
  const handleExtendBooking = async () => {
    if (!user || !booking) return;
    
    // Validation
    if (extendEndDate <= new Date(booking.endTime)) {
      toast.error("New end time must be after the current end time");
      return;
    }
    
    setIsExtending(true);
    try {
      const result = await extendBooking({
        bookingId: booking._id,
        newEndTime: extendEndDate.getTime(),
        adminId: user.id,
        userId: user.id // Admin is performing action
      });
      
      toast.success(`Booking extended successfully! Additional cost: ₹${result.additionalCost}`);
      setShowExtendModal(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      toast.error(error.message || "Failed to extend booking");
    } finally {
      setIsExtending(false);
    }
  };
  
  // Handle early return
  const handleEarlyReturn = async () => {
    if (!user || !booking) return;
    
    // Validation
    if (new Date(booking.startTime) >= earlyReturnDate) {
      toast.error("Return time must be after the booking start time");
      return;
    }
    
    setIsReturningEarly(true);
    try {
      const result = await processEarlyReturn({
        bookingId: booking._id,
        actualEndTime: earlyReturnDate.getTime(),
        adminId: user.id,
        userId: user.id // Admin is performing action
      });
      
      toast.success(`Early return processed! Final price: ₹${result.adjustedPrice}`);
      setShowEarlyReturnModal(false);
      if (onActionComplete) onActionComplete();
    } catch (error) {
      toast.error(error.message || "Failed to process early return");
    } finally {
      setIsReturningEarly(false);
    }
  };
  
  // Only show specific actions based on booking status
  if (!booking) return null;
  
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {/* Extension Button */}
      {booking.status === "confirmed" && (
        <button
          onClick={() => setShowExtendModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-blue-600 shadow-sm text-sm font-medium rounded text-blue-600 bg-white hover:bg-blue-50"
          title="Extend booking duration"
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Extend
        </button>
      )}
      
      {/* Early Return Button */}
      {booking.status === "confirmed" && (
        <button
          onClick={() => setShowEarlyReturnModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-green-600 shadow-sm text-sm font-medium rounded text-green-600 bg-white hover:bg-green-50"
          title="Process early return"
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Early Return
        </button>
      )}
      
      {/* Extension Modal - Admin Version */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Extend Booking</h3>
            <p className="text-sm text-gray-500 mb-4">
              Customer: <span className="font-medium">{booking.userName}</span> | 
              Bike: <span className="font-medium">{bike?.name || 'Unknown'}</span>
            </p>
            
            <div className="mb-4">
              <Label>
                Current End Time
              </Label>
              <p className="text-sm bg-gray-50 p-2 rounded-md">
                {new Date(booking.endTime).toLocaleString()}
              </p>
            </div>
            
            <div className="mb-4">
              <Label>
                New End Time
              </Label>
              <DatePicker
                selected={extendEndDate}
                onChange={setExtendEndDate}
                showTimeSelect
                timeIntervals={30}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="shadow-input dark:placeholder-text-neutral-600 h-10 border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                minDate={new Date(booking.endTime)}
              />
            </div>
            
            {/* Admin notes */}
            <div className="mb-4">
             
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                placeholder="Add notes about this extension"
              />
            </div>
            
            {/* Price calculation */}
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-blue-700 mb-2">Extension Details</h4>
              <div className="text-sm">
                <p className="flex justify-between mb-1">
                  <span>Original Duration:</span>
                  <span>{Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60))} hours</span>
                </p>
                <p className="flex justify-between mb-1">
                  <span>Additional Time:</span>
                  <span>{Math.ceil((extendEndDate.getTime() - booking.endTime) / (1000 * 60 * 60))} hours</span>
                </p>
                <p className="flex justify-between font-medium border-t border-blue-200 pt-2 mt-2">
                  <span>Additional Cost:</span>
                  <span>₹{Math.ceil((extendEndDate.getTime() - booking.endTime) / (1000 * 60 * 60)) * (bike?.pricePerHour || 0)}</span>
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendBooking}
                disabled={isExtending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isExtending ? "Processing..." : "Confirm Extension"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Early Return Modal - Admin Version */}
      {showEarlyReturnModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Process Early Return</h3>
            <p className="text-sm text-gray-500 mb-4">
              Customer: <span className="font-medium">{booking.userName}</span> | 
              Bike: <span className="font-medium">{bike?.name || 'Unknown'}</span>
            </p>
            
            <div className="mb-4">
              <Label>
                Original End Time
              </Label>
              <p className="text-sm bg-gray-50 p-2 rounded-md">
                {new Date(booking.endTime).toLocaleString()}
              </p>
            </div>
            
            <div className="mb-4">
              <Label>
                Actual Return Time
              </Label>
              <DatePicker
                selected={earlyReturnDate}
                onChange={setEarlyReturnDate}
                showTimeSelect
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="shadow-input dark:placeholder-text-neutral-600 h-10 border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                minDate={new Date(booking.startTime)}
                maxDate={new Date(Math.min(Date.now(), booking.endTime - 1000 * 60))}
              />
            </div>
            
            {/* Admin price adjustment */}
            <div className="mb-4">
              <Label>
                Price Adjustment (%)
              </Label>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="-100"
                  max="100"
                  value={adjustPriceByPercentage}
                  onChange={(e) => setAdjustPriceByPercentage(parseInt(e.target.value) || 0)}
                  
                />
                <span className="ml-2 text-sm text-gray-500">
                  % {adjustPriceByPercentage > 0 ? 'increase' : adjustPriceByPercentage < 0 ? 'discount' : ''}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use this to apply a discount or additional charge
              </p>
            </div>
            
            {/* Admin notes */}
            <div className="mb-4">
             
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Add notes about this early return"
              />
            </div>
            
            {/* Price calculation */}
            <div className="bg-green-50 p-4 rounded-md mb-4">
              <h4 className="text-sm font-medium text-green-700 mb-2">Return Details</h4>
              <div className="text-sm">
                {(() => {
                  // Calculate pricing details
                  const originalHours = Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60));
                  const actualHours = Math.max(1, Math.ceil((earlyReturnDate.getTime() - booking.startTime) / (1000 * 60 * 60)));
                  const hourlyRate = booking.totalPrice / originalHours;
                  let adjustedPrice = actualHours * hourlyRate;
                  
                  // Apply admin adjustment if specified
                  if (adjustPriceByPercentage !== 0) {
                    adjustedPrice = adjustedPrice * (1 + adjustPriceByPercentage / 100);
                  }
                  
                  const refundAmount = Math.max(0, booking.totalPrice - adjustedPrice);
                  
                  return (
                    <>
                      <p className="flex justify-between mb-1">
                        <span>Original Price:</span>
                        <span>₹{booking.totalPrice}</span>
                      </p>
                      <p className="flex justify-between mb-1">
                        <span>Adjusted Price:</span>
                        <span>₹{adjustedPrice.toFixed(2)}</span>
                      </p>
                      <p className="flex justify-between font-medium border-t border-green-200 pt-2 mt-2">
                        <span>Refund Amount:</span>
                        <span>₹{refundAmount.toFixed(2)}</span>
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEarlyReturnModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEarlyReturn}
                disabled={isReturningEarly}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isReturningEarly ? "Processing..." : "Process Early Return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}