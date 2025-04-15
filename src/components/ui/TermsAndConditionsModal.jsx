// src/components/ui/TermsAndConditionsModal.jsx  
"use client";  
import { useState } from 'react';  
import { motion } from 'framer-motion';  
import { X, AlertTriangle, Check } from 'lucide-react';

export default function TermsAndConditionsModal({ isOpen, onClose, onAccept }) {  
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;  
   
  // Handle scroll to sections for mobile  
  const scrollToSection = (id) => {  
    const element = document.getElementById(id);  
    if (element) {  
      element.scrollIntoView({ behavior: 'smooth' });  
    }  
  };
  

  return (  
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">  
      <motion.div  
        initial={{ opacity: 0, scale: 0.9 }}  
        animate={{ opacity: 1, scale: 1 }}  
        className="bg-white rounded-lg max-w-2xl w-full flex flex-col max-h-[90vh]"  
      >  
        <div className="p-4 sm:p-6 border-b flex justify-between items-center sticky top-0 bg-white rounded-t-lg z-10">  
          <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>  
          <button  
            onClick={onClose}  
            className="text-gray-400 hover:text-gray-500"  
          >  
            <X className="h-5 w-5" />  
          </button>  
        </div>  
         
        {/* Quick navigation for mobile */}  
        <div className="lg:hidden px-4 py-2 overflow-x-auto whitespace-nowrap border-b">  
          <div className="inline-flex space-x-2">  
            <button  
              onClick={() => scrollToSection('section-1')}  
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"  
            >  
              Rental Agreement  
            </button>  
            <button  
              onClick={() => scrollToSection('section-2')}  
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"  
            >  
              Eligibility  
            </button>  
            <button  
              onClick={() => scrollToSection('section-3')}  
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"  
            >  
              Vehicle Use  
            </button>  
            <button  
              onClick={() => scrollToSection('section-4')}  
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"  
            >  
              Payment  
            </button>  
            <button  
              onClick={() => scrollToSection('section-5')}  
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"  
            >  
              Cancellation  
            </button>  
          </div>  
        </div>  
         
        <div className="overflow-y-auto flex-grow px-4 sm:px-6 py-4">  
          <div className="prose prose-sm max-w-none">  
            <section id="section-1">  
              <h3 className='font-bold'>1. Rental Agreement</h3>  
              <p>  
                This Rental Agreement constitutes a contract between you (the &quot;Renter&quot;) and ZipBikes (the &quot;Company&quot;),  
                governing the rental of vehicles through our platform.  
              </p>  
            </section>  
             
            <section id="section-2">  
              <h3 className=' font-bold mt-4'>2. Eligibility</h3>  
              <p>  
                To rent a vehicle, you must:  
              </p>  
              <ul className='ml-4'>  
                <li>a. Be at least 18 years of age</li>  
                <li>b. Possess a valid driver&apos;s license</li>  
                <li>c. Provide accurate personal information</li>  
                <li>d. Have a valid payment method</li>  
              </ul>  
            </section>  
             
            <section id="section-3">  
              <h3 className=' font-bold mt-4'>3. Vehicle Use</h3>  
              <p>  
                The Renter agrees to:  
              </p>  
              <ul className='ml-4'>  
                <li>a. Use the vehicle only for personal transportation</li>  
                <li>b. Not use the vehicle for any illegal activities</li>  
                <li>c. Not exceed passenger or weight limitations</li>  
                <li>d. Not modify or alter the vehicle in any way</li>  
                <li>e. Return the vehicle in the same condition as received</li>  
                <li>f. If three people are found riding a vehicle then Rs 2000 will be charged and vehicle will be seized on the spot.</li>  
                <li>g. After store closing (i.e 10PM), if the vehicle is still in your possession than double charges will be applied i.e Rs 160 per hour. </li>  

              </ul>  
            </section>  
             
            <section id="section-4">  
              <h3 className=' font-bold mt-4'>4. Payment Terms</h3>  
              <p>  
                The Renter understands and agrees:  
              </p>  
              <ul className='ml-4'>  
                <li>a. To pay the deposit amount at the time of booking</li>  
                <li>b. To pay the remaining balance upon return of the vehicle</li>  
                <li>c. To be responsible for any additional charges due to late returns or damages</li>  
                <li>d. That cancellation fees may apply as per our cancellation policy</li>  
              </ul>  
            </section>  
             
            <section id="section-5">  
              <h3 className=' font-bold mt-4'>5. Insurance and Liability</h3>  
              <p>  
                The Renter acknowledges:  
              </p>  
              <ul className='ml-4'>  
                <li>a. They are responsible for any damage to the vehicle during the rental period</li>  
                <li>b. Basic insurance is included in the rental price</li>  
                <li>c. The Renter is responsible for any deductible amounts</li>  
                <li>d. Personal property in the vehicle is not covered by our insurance</li>  
              </ul>  
            </section>  
             
            <section id="section-6">  
              <h3 className=' font-bold mt-4'>6. Cancellation Policy</h3>  
              <p>  
                Cancellations made:  
              </p>  
              <ul className='ml-4'>  
                <li>a. More than 15 minutes before pickup: Full refund of deposit excluding platform fee</li>  
                <li>b. Less than 15 minutes before pickup: No refund of deposit</li>  
                <li>c. Failure to pick up: No refund</li>  
              </ul>  
            </section>  
             
            <section id="section-7">  
              <h3 className=' font-bold mt-4'>7. Privacy Policy</h3>  
              <p>  
                The Company collects and processes personal data in accordance with our Privacy Policy,  
                which the Renter acknowledges having read and understood.  
              </p>  
            </section>  
             
            <section id="section-8">  
              <h3 className=' font-bold mt-4'>8. Dispute Resolution</h3>  
              <p>  
                Any disputes arising from this agreement shall be resolved through arbitration  
                in accordance with the laws of the jurisdiction where the Company is registered.  
              </p>  
            </section>  
             
            <section id="section-9">  
              <h3 className=' font-bold mt-4'>9. Term and Termination</h3>  
              <p>  
                This agreement is effective upon booking and ends upon the return of the vehicle,  
                provided all payments have been made and no damages are found.  
              </p>  
            </section>  
          </div>  
        </div>  
         
        <div className="border-t p-4 sm:p-6 sticky bottom-0 bg-white rounded-b-lg z-10">  
          <div className="flex flex-col sm:flex-row sm:items-center">  
            <div className="flex items-start mb-4 sm:mb-0 sm:flex-1">  
              <div className="flex-shrink-0">  
                <input  
                  id="terms"  
                  name="terms"  
                  type="checkbox"  
                  checked={accepted}  
                  onChange={(e) => setAccepted(e.target.checked)}  
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"  
                />  
              </div>  
              <label htmlFor="terms" className="ml-3 text-sm text-gray-700">  
                I have read and agree to the terms and conditions  
              </label>  
            </div>  
             
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">  
              <button  
                type="button"  
                onClick={onClose}  
                className="w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"  
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
                className={`w-full sm:w-auto inline-flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${  
                  accepted  
                    ? 'bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'  
                    : 'bg-gray-400 cursor-not-allowed'  
                }`}  
              >  
                {accepted ? <Check className="mr-1.5 h-4 w-4" /> : <AlertTriangle className="mr-1.5 h-4 w-4" />}  
                Accept & Continue  
              </button>  
            </div>  
          </div>  
        </div>  
      </motion.div>  
    </div>  
  );  
}