"use client";
import { motion } from 'framer-motion';

export default function RefundPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Refund and Cancellation Policy</h1>
        <p className="mt-2 text-gray-600">
          Last updated: April 1, 2025
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-6 md:p-8"
      >
        <div className="prose prose-primary max-w-none">
          <h2 className=' text-xl font-bold mb-4'>1. Introduction</h2>
          <p>
            This Refund and Cancellation Policy outlines the terms and conditions for refunds and cancellations 
            of bookings made through the ZipBikes platform. By making a booking through our platform, you agree 
            to be bound by this policy.
          </p>
          <p>
            We understand that plans can change, and we strive to offer a fair and transparent refund and 
            cancellation process. This policy is designed to balance the needs of our customers with the 
            operational requirements of our business.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>2. Definitions</h2>
          <p>In this Refund and Cancellation Policy, unless the context requires otherwise:</p>
          <ul className='ml-4'>
            <li>a. &quot;Booking&quot; refers to a reservation made through our platform for the rental of a vehicle.</li>
            <li>b. &quot;Cancellation&quot; refers to the termination of a booking before the start of the rental period.</li>
            <li>c. &quot;Modification&quot; refers to any change to a booking, including changes to the rental period, vehicle.</li>
            <li>d. &quot;Deposit&quot; refers to the amount paid at the time of booking to secure the reservation.</li>
            <li>e. &quot;Rental Fee&quot; refers to the total amount charged for the rental of a vehicle for the specified rental period.</li>
            <li>f. &quot;Rental Period&quot; refers to the period between the start and end times specified in your booking.</li>
          </ul>

          <h2 className=' text-xl font-bold mb-4 mt-6'>3. Booking Confirmation and Payment</h2>
          <p>
            When you make a booking through our platform, you will be required to pay a deposit of ₹42.
          </p>
          <p>
            The remaining balance of the rental fee is due upon the return of the vehicle at the end of the 
            rental period. The total amount due will be calculated based on the actual rental period, which 
            may differ from the booked rental period if the vehicle is returned early or late.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>4. Cancellation Policy</h2>
          <h3 className=' text-md font-semibold  mb-4'><em>4.1 Cancellation by Customer</em></h3>
          <p>
            You may cancel your booking at any time through our platform or by contacting our customer service team. 
            The refund amount, if any, will depend on when the cancellation is made:
          </p>
          <ul className='ml-4'>
            <li>
              a. <strong>Cancellations made more than 15 minutes before the start of the rental period: </strong> 
              You will receive a full refund of the deposit excluding the platform fee.
            </li>
            <li>
              b. <strong>Cancellations made less than 15 minutes before the start of the rental period: </strong> 
              No refund will be provided.
            </li>
            <li>
              c. <strong>No-shows (failure to pick up the vehicle at the scheduled time): </strong> 
              No refund will be provided plus some penalty will be applied.
            </li>
          </ul>
          
          <h3 className=' text-md font-semibold  mb-4 mt-6'><em>4.2 Cancellation by ZipBikes</em></h3>
          <p>
            In rare circumstances, we may need to cancel your booking due to unforeseen circumstances, such as 
            vehicle damage, maintenance issues, or weather conditions that make riding unsafe. In such cases:
          </p>
          <ul className='ml-4'>
            <li>a. We will notify you as soon as possible about the cancellation.</li>
            <li>b. We will offer you an alternative vehicle if available.</li>
            <li>c. If no alternative is available or acceptable to you, we will provide a full refund of the deposit including the platform fee.</li>
            <li>d. If the cancellation is due to circumstances beyond our control (such as severe weather), we may offer additional compensation or discounts on future bookings at our discretion.</li>
          </ul>

          <h2 className=' text-xl font-bold mb-4 mt-6'>5. Modification Policy</h2>
          <p>
            You may request to modify your booking at any time through our platform or by contacting our customer 
            service team. Modifications are subject to vehicle availability and may result in changes to the rental fee.
          </p>
          <ul className='ml-4'>
            <li>
              a. <strong>Modifications made more than 24 hours before the start of the rental period: </strong> 
              No modification fee will be charged.
            </li>
            <li>
              b. <strong>Modifications made less than 24 hours before the start of the rental period: </strong> 
              A modification fee of ₹20 may be charged.
            </li>
            <li>
              c. <strong>If the modified booking results in a higher rental fee: </strong> 
              You will be required to pay the difference.
            </li>
            <li>
              d. <strong>If the modified booking results in a lower rental fee: </strong> 
              We will refund the difference according to our refund policy.
            </li>
          </ul>
          
          <h2 className=' text-xl font-bold mb-4 mt-6'>6. Early Returns and Late Returns</h2>
          <h3 className=' text-md font-semibold  mb-4'><em>6.1 Early Returns</em></h3>
          <p>
            If you return the vehicle before the end of the booked rental period, you may be eligible for a partial 
            refund of the rental fee, subject to the following conditions:
          </p>
          <ul className='ml-4'>
            <li>a. The early return must be communicated to us at least 15 minutes before the actual return time.</li>
            <li>b. A minimum rental period of 1 hour will be charged, regardless of the actual usage time.</li>
            <li>c. Refunds for early returns will be calculated on a pro-rata basis, based on the hourly rate.</li>
          </ul>
          
          <h3 className=' text-md font-semibold  mb-4 mt-6'><em>6.2 Late Returns</em></h3>
          <p>
            If you return the vehicle after the end of the booked rental period, additional charges will apply:
          </p>
          <ul className='ml-4'>
            <li>
              a. <strong>Up to 15 minutes late: </strong> 
              A period of 15 minutes will be provided, with no additional charges.
            </li>
            <li>
              b. <strong>30 minutes to 2 hours late: </strong> 
              You will be charged for an additional hour at the 1.5 times the standard hourly rate.
            </li>
            <li>
              c. <strong>More than 2 hours late: </strong> 
              You will be charged for additional hours at 2 times the standard hourly rate.
            </li>
            <li>
              d. <strong>More than 5 hours late: </strong> 
              This may be considered unauthorized use of the vehicle, and additional penalties may apply.
            </li>
          </ul>
          <p>
            Late returns may also impact other customers&apos; bookings. If your late return causes another booking to be 
            cancelled or modified, you may be charged a disruption fee of up to ₹500, in addition to the late return 
            charges.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>7. Refund Process and Timeline</h2>
          <p>
            Once refund is processed, it will be credited in bank account within 5-7 business working days.
          </p>
        
          <p>
            If you have not received your refund within the expected timeframe, please contact our customer service team 
            for assistance.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>8. Disputes and Special Circumstances</h2>
          <p>
            If you believe that a refund has been incorrectly processed or denied, please contact our customer service 
            team with your booking details and a description of the issue. We will review your case and respond within 
            48 hours.
          </p>
          <p>
            In special circumstances, such as illness, accidents, or other emergencies, we may, at our discretion, 
            offer refunds or credits outside of our standard policy. Such exceptions will be considered on a 
            case-by-case basis and may require documentation.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>9. Damage Deposits and Charges</h2>
          <p>
            In addition to the rental fee, we may require a damage deposit for certain vehicles or for users with 
            limited rental history. The damage deposit amount, if applicable, will be clearly displayed during the 
            booking process.
          </p>
          <p>
            The damage deposit will be refunded within 7 business days after the return of the vehicle, provided 
            that the vehicle is returned in the same condition as it was at the start of the rental period, normal 
            wear and tear excepted.
          </p>
          <p>
            If the vehicle is damaged during the rental period, we may deduct the cost of repairs from the damage 
            deposit. If the cost of repairs exceeds the amount of the damage deposit, you will be liable for the 
            additional amount.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>10. Changes to this Policy</h2>
          <p>
            We reserve the right to modify this Refund and Cancellation Policy at any time, in our sole discretion. 
            Any changes will be effective immediately upon posting on our platform. Your continued use of our platform 
            or services after any such changes constitutes your acceptance of the new Refund and Cancellation Policy.
          </p>
          <p>
            We will notify you of any material changes to this policy by email or by posting a notice on our platform.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            If you have any questions or concerns about this Refund and Cancellation Policy, please contact us at:
          </p>
          <p>
            <strong>ZipBikes</strong><br />
            WARD NO 3, NEAR IISER COLLEGE, BOURI, HUZUR,<br/>
            SHOP NO 2, 462030, Bhopal,
            <br/>Madhya Pradesh, PIN: 462030,
            India<br />
            Email: mrtravels1817@gmail.com<br />
            Phone: +91 7909611817
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>12. Examples of Refund Calculations</h2>
          <p>
            To help you understand our refund policy better, here are some examples of how refunds are calculated:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <h3 className="font-medium text-lg mb-2">Example 1: Cancellation more than 15 minutes before rental</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Booking: 2-hour bike rental at ₹80/hour (Total:162)</li>
              <li>Deposit paid: ₹42</li>
              <li>Cancellation: 15 minutes before rental start time</li>
              <li>Refund amount: ₹40 (full deposit - platform fee)</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <h3 className="font-medium text-lg mb-2">Example 2: Cancellation less than 15 minutes before rental</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Booking: 4-hour bike rental at ₹80/hour (Total: ₹320)</li>
              <li>Deposit paid: ₹42</li>
              <li>Cancellation: 10 minutes rental start time</li>
              <li>Refund amount: ₹0 (0% of deposit)</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <h3 className="font-medium text-lg mb-2">Example 3: Early return</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Booking: 6-hour bike rental at ₹80/hour (Total: ₹480)</li>
              <li>Deposit paid: ₹42</li>
              <li>Actual usage: 4 hours (returned 2 hours early)</li>
              <li>Final payment: ₹320 (4 hours × ₹80) - ₹40 (deposit to owner) = ₹280</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg my-4">
            <h3 className="font-medium text-lg mb-2">Example 4: Late return</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Booking: 3-hour bike rental at ₹80/hour (Total: ₹240)</li>
              <li>Deposit paid: ₹42</li>
              <li>Actual usage: 4 hours (returned 1 hour late)</li>
              <li>Final payment: ₹240 (original booking) + ₹120 (1 extra hour) - ₹40 (deposit to owner) = ₹320</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}