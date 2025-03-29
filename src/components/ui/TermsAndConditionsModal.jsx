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
            <h3>1. Rental Agreement</h3>
            <p>
              This Rental Agreement constitutes a contract between you (the &quot;Renter&quot;) and BikeFlix (the &quot;Company&quot;), 
              governing the rental of vehicles through our platform.
            </p>
            
            <h3>2. Eligibility</h3>
            <p>
              To rent a vehicle, you must:
            </p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Possess a valid driver&quot;s license</li>
              <li>Provide accurate personal information</li>
              <li>Have a valid payment method</li>
            </ul>
            
            <h3>3. Vehicle Use</h3>
            <p>
              The Renter agrees to:
            </p>
            <ul>
              <li>Use the vehicle only for personal transportation</li>
              <li>Not use the vehicle for any illegal activities</li>
              <li>Not exceed passenger or weight limitations</li>
              <li>Not modify or alter the vehicle in any way</li>
              <li>Return the vehicle in the same condition as received</li>
            </ul>
            
            <h3>4. Payment Terms</h3>
            <p>
              The Renter understands and agrees:
            </p>
            <ul>
              <li>To pay the deposit amount at the time of booking</li>
              <li>To pay the remaining balance upon return of the vehicle</li>
              <li>To be responsible for any additional charges due to late returns or damages</li>
              <li>That cancellation fees may apply as per our cancellation policy</li>
            </ul>
            
            <h3>5. Insurance and Liability</h3>
            <p>
              The Renter acknowledges:
            </p>
            <ul>
              <li>They are responsible for any damage to the vehicle during the rental period</li>
              <li>Basic insurance is included in the rental price</li>
              <li>The Renter is responsible for any deductible amounts</li>
              <li>Personal property in the vehicle is not covered by our insurance</li>
            </ul>
            
            <h3>6. Cancellation Policy</h3>
            <p>
              Cancellations made:
            </p>
            <ul>
              <li>More than 24 hours before pickup: Full refund</li>
              <li>Less than 24 hours before pickup: No refund of deposit</li>
              <li>Failure to pick up: No refund</li>
            </ul>
            
            <h3>7. Privacy Policy</h3>
            <p>
              The Company collects and processes personal data in accordance with our Privacy Policy, 
              which the Renter acknowledges having read and understood.
            </p>
            
            <h3>8. Dispute Resolution</h3>
            <p>
              Any disputes arising from this agreement shall be resolved through arbitration 
              in accordance with the laws of the jurisdiction where the Company is registered.
            </p>
            
            <h3>9. Term and Termination</h3>
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