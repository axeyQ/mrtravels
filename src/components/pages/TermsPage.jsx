"use client";
import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
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
            Welcome to ZipBikes. These Terms and Conditions govern your use of our website and services, 
            including our mobile application, and the rental of vehicles through our platform. By accessing 
            our platform or using our services, you agree to be bound by these Terms and Conditions.
          </p>
          <p>
            Please read these Terms and Conditions carefully before using our services. If you do not 
            agree with any part of these terms, you must not use our services.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>2. Definitions</h2>
          <p>In these Terms and Conditions, unless the context requires otherwise:</p>
          <ul className='ml-4'>
            <li>a. &quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot; refers to ZipBikes.</li>
            <li>b. &quot;User,&quot; &quot;you,&quot; or &quot;your&quot; refers to any person who accesses or uses our platform or services.</li>
            <li>c. &quot;Platform&quot; refers to our website, web application, and any other online services we provide.</li>
            <li>d. &quot;Vehicle&quot; refers to any bike, moped, or other transportation device available for rental through our platform.</li>
            <li>e. &quot;Rental Period&quot; refers to the period between the start and end times specified in your booking.</li>
          </ul>

          <h2 className=' text-xl font-bold mb-4 mt-6'>3. Account Registration</h2>
          <p>
            To use our services, you must create an account with us. You agree to provide accurate, current, 
            and complete information during the registration process and to update such information to keep it 
            accurate, current, and complete.
          </p>
          <p>
            You are responsible for safeguarding your account credentials and for all activities that occur under 
            your account. You agree to notify us immediately of any unauthorized use of your account or any other 
            breach of security.
          </p>
          <p>
            We reserve the right to disable your account if we determine, in our sole discretion, that you have 
            violated these Terms and Conditions or if we believe your account has been compromised.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>4. Eligibility Requirements</h2>
          <p>To rent a vehicle through our platform, you must:</p>
          <ul className='ml-4'>
            <li>a. Be at least 18 years of age;</li>
            <li>b. Possess a valid driver&apos;s license appropriate for the type of vehicle you wish to rent;</li>
            <li>c. Complete our verification process, which may include providing photographs of your driver&apos;s license and other identification documents.</li>
          </ul>
          <p>
            By renting a vehicle through our platform, you represent and warrant that you meet all eligibility requirements.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>5. Booking and Rental Process</h2>
          <p>
            All bookings must be made through our platform. To book a vehicle, you must select a vehicle, 
            specify the desired rental period, and make payment according to our payment terms.
          </p>
          <p>
            Upon confirmation of your booking, you will receive a booking confirmation. The booking confirmation 
            constitutes a legally binding agreement between you and us, subject to these Terms and Conditions.
          </p>
          <p>
            The rental period begins at the start time specified in your booking confirmation and ends at the end time 
            specified in your booking confirmation. You must return the vehicle to the designated location by the end 
            of the rental period.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>6. Payment Terms</h2>
          <p>
            By making a booking, you authorize us to charge the payment method registered with your account for all 
            fees associated with your booking, including the rental fee, deposit, any applicable taxes, and any 
            additional charges that may be incurred during the rental period.
          </p>
          <p>
            Our fees are as displayed on our platform at the time of booking. We reserve the right to change our 
            fees at any time, but changes will not affect bookings that have already been confirmed.
          </p>
          <p>
            We require a refundable deposit for all bookings. The deposit amount will be displayed during the booking 
            process. The deposit will be refunded to your original payment method within 7 business days of the end of 
            the rental period, less any amounts deducted for damages, late returns, or other charges.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>7. Cancellation and Modification</h2>
          <p>
            You may cancel or modify your booking subject to our cancellation and modification policies, 
            which will be displayed during the booking process and on our platform.
          </p>
          <p>
            In general, cancellations made within 15 minutes of booking will 
            receive a refund of deposit excluding platform fee which will be Rs. 2. Cancellations after 15 minutes of booking will result in you not getting your deposit amount.
          </p>
          <p>
            Modifications to bookings are subject to vehicle availability and may result in changes to the 
            rental fee.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>8. Vehicle Use and Restrictions</h2>
          <p>During the rental period, you agree to:</p>
          <ul className='ml-4'>
            <li>a. Use the vehicle only for personal transportation purposes;</li>
            <li>b. Operate the vehicle in accordance with all applicable laws and regulations;</li>
            <li>c. Wear appropriate safety gear, including a helmet, as required by law;</li>
            <li>d. Return the vehicle in the same condition as it was at the start of the rental period, normal wear and tear excepted;</li>
            <li>e. Not allow any person other than yourself to operate the vehicle;</li>
            <li>f. Not operate the vehicle under the influence of alcohol, drugs, or any other substance that may impair your ability to safely operate the vehicle;</li>
            <li>g. Not use the vehicle for any illegal purpose;</li>
            <li>h. Not remove any parts from the vehicle or make any modifications to the vehicle;</li>
            <li>i. Not exceed the maximum weight capacity of the vehicle;</li>
            <li>j. Not use the vehicle in any race, competition, or for any commercial purpose;</li>
            <li>h. Not use the vehicle off-road or on any surface not intended for the type of vehicle you are renting; and</li>
            <li>i. Immediately report any damage, malfunction, or accident involving the vehicle to us.</li>
          </ul>

          <h2 className=' text-xl font-bold mb-4 mt-6'>9. Insurance and Liability</h2>
          <p>
            We provide basic insurance coverage for all rentals, subject to the terms and conditions of our insurance 
            policy. The details of the insurance coverage will be provided during the booking process.
          </p>
          <p>
            You are responsible for any damage to the vehicle during the rental period that is not covered by insurance, 
            including damages resulting from your breach of these Terms and Conditions or your negligence.
          </p>
          <p>
            You agree to indemnify and hold us harmless from and against any and all claims, damages, losses, liabilities, 
            costs, and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of the vehicle 
            or your breach of these Terms and Conditions.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>10. Privacy Policy</h2>
          <p>
            We collect and process personal information in accordance with our Privacy Policy, which is incorporated into 
            these Terms and Conditions by reference. By using our services, you consent to the collection and processing 
            of your personal information as described in our Privacy Policy.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>11. Intellectual Property</h2>
          <p>
            All content on our platform, including text, graphics, logos, icons, images, audio clips, digital downloads, 
            and software, is the property of ZipBikes or our licensors and is protected by copyright, trademark, and other 
            intellectual property laws.
          </p>
          <p>
            You may not reproduce, modify, display, distribute, or use any content from our platform without our prior 
            written permission.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>12. Disclaimers and Limitations of Liability</h2>
          <p>
            Our platform and services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties, 
            express or implied, regarding the quality, accuracy, reliability, or availability of our platform or services.
          </p>
          <p>
            To the maximum extent permitted by law, we disclaim all warranties, express or implied, including implied warranties 
            of merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p>
            In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, 
            including lost profits, arising out of or related to your use of our platform or services, even if we have 
            been advised of the possibility of such damages.
          </p>
          <p>
            Our total liability for any claim arising out of or related to these Terms and Conditions shall not exceed 
            the total amount you have paid to us in the one month preceding the claim.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>13. Termination</h2>
          <p>
            We may terminate or suspend your account and access to our services at any time, without prior notice or 
            liability, for any reason, including if you breach these Terms and Conditions.
          </p>
          <p>
            Upon termination, your right to use our services will immediately cease. All provisions of these Terms and 
            Conditions that by their nature should survive termination shall survive termination, including, without 
            limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>14. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India, 
            without regard to its conflict of law principles.
          </p>
          <p>
            Any dispute arising out of or related to these Terms and Conditions shall be resolved through binding 
            arbitration in accordance with the rules of the Indian Arbitration Association. The arbitration shall 
            take place in Bhopal, India, and the language of the arbitration shall be English.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>15. Changes to Terms and Conditions</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time, in our sole discretion. Any 
            changes will be effective immediately upon posting on our platform. Your continued use of our platform 
            or services after any such changes constitutes your acceptance of the new Terms and Conditions.
          </p>
          <p>
            We will notify you of any material changes to these Terms and Conditions by email or by posting a 
            notice on our platform.
          </p>

          <h2 className=' text-xl font-bold mb-4 mt-6'>16. Contact Information</h2>
          <p>
            If you have any questions or concerns about these Terms and Conditions, please contact us at:
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
        </div>
      </motion.div>
    </div>
  );
}