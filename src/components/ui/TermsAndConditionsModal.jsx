// src/components/ui/TermsAndConditionsModal.jsx
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] flex flex-col"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
        
        <div className="overflow-y-auto flex-grow mb-6 pr-2">
          <div className="prose prose-sm max-w-none">
            <h3 className='underline font-semibold'>1. Rental Agreement</h3>
            <p>
              This Rental Agreement constitutes a contract between <strong>you (the &quot;Renter&quot;)</strong> and <strong>M.R Travels and Rental Services (the &quot;Company&quot;)</strong>, 
              governing the rental of vehicles through our platform.
            </p>
            
            <h3 className='mt-2 underline font-semibold'>2. Eligibility</h3>
            <p>
              To rent a vehicle, you must:
            </p>
            <ul>
              <li>a. Be at least <strong>18 years of age</strong></li>
              <li>b. Possess a <strong>valid driver&quot;s license</strong></li>
              <li>c. Provide <strong>accurate personal information</strong></li>
            </ul>
            
            <h3 className='mt-2 underline font-semibold'>3. Vehicle Use</h3>
            <p>
              <strong>i. The Renter agrees to:</strong>
            </p>
            <ul>
              <li>a. Use the vehicle <strong>only for personal transportation</strong></li>
              <li>b. Not use the vehicle for <strong>any illegal activities</strong></li>
              <li>c. Not exceed passenger or weight limitations i.e <strong>only two people per vehicle</strong></li>
              <li>d. Not <strong>modify or alter</strong> the vehicle in any way</li>
              <li>e. Return the vehicle in the <strong>same condition as received</strong></li>
            </ul>
            
            <h3 className='mt-2 underline font-semibold'>4. Payment Terms</h3>
            <p>
              <strong>i. The Renter understands and agrees:</strong>
            </p>
            <ul>
              <li>a. To pay the <strong>deposit amount</strong> at the time of booking</li>
              <li>b. To pay the <strong>remaining balance</strong> upon return of the vehicle</li>
              <li>c. To be <strong>responsible for any additional charges</strong> due to damages</li>
              <li>d. That cancellation fees may apply as per our cancellation policy</li>
            </ul>
            
            <h3 className='mt-2 underline font-semibold'>5. Insurance and Liability</h3>
            <p>
              <strong>i. The Renter acknowledges:</strong>
            </p>
            <ul>
              <li>a. They are <strong>responsible for any damage</strong> to the vehicle during the rental period</li>
              <li>b. <strong>Basic insurance</strong> is included in the rental price</li>
              <li>c. The Renter is responsible for any <strong>deductible amounts</strong></li>
              <li>d. <strong>Personal property</strong> in the vehicle is not covered by our insurance</li>
            </ul>
            
            <h3 className='mt-2 underline font-semibold'>6. Cancellation Policy</h3>
            <p>
              <strong>i. Cancellations made:</strong>
            </p>
            <ul>
              <li>a. Till pickup time: <strong>Full refund of deposit</strong></li>
              <li>b. Failure to pick up: <strong>No refund of deposit and full payment for an hour to be paid i.e Rs.80</strong></li>
            </ul>
            
            <h3 className='mt-2 underline font-semibold'>7. Privacy Policy</h3>
            <p>
              The Company collects and processes personal data in accordance with our <strong>Privacy Policy</strong>, 
              which the <strong>Renter acknowledges having read and understood</strong>.
            </p>
            
            <h3 className='mt-2 underline font-semibold'>8. Dispute Resolution</h3>
            <p>
              Any disputes arising from this agreement shall be resolved through arbitration 
              in accordance with the <strong>laws of the jurisdiction where the Company is registered</strong>.
            </p>
            
            <h3 className='mt-2 underline font-semibold'>9. Term and Termination</h3>
            <p>
              This agreement is effective upon booking and ends upon the return of the vehicle, 
              provided all payments have been made and no damages are found.
            </p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex items-start mb-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">
                I have read and agree to the terms and conditions
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (accepted) {
                  onAccept();
                }
              }}
              disabled={!accepted}
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                accepted 
                  ? 'bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}