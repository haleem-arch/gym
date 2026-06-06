import { motion } from 'framer-motion';
import { X, Shield, FileText, Cookie } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'cookies';
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield className="text-blue-400 w-6 h-6" />,
          isPlainText: true,
          content: `PRIVACY POLICY
Life Gym Platform
Effective Date: June 6, 2026
Last Updated: June 6, 2026

1. Introduction
Life Gym ("we," "our," or "us") operates a professional fitness coaching SaaS platform that enables certified coaches to manage their athletes, track progress, and deliver personalized training programs. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our platform.
By accessing or using Life Gym, you agree to the terms outlined in this Privacy Policy.

2. Who We Are
Life Gym is a fitness coaching management platform based in Egypt. We serve two types of users:
- Coaches — fitness professionals who manage athlete programs
- Athletes — clients who track their training, nutrition, and body composition

3. Information We Collect
3.1 From Coaches
- Full name, email address, and phone number
- Professional information (certifications, specialization, years of experience)
- Gym name, city, and social media handles
- Payment transaction details and renewal receipts
- Login credentials (encrypted)

3.2 From Athletes
- Full name, username, and phone number
- Age, height, gender, and experience level
- Body composition data (weight, body fat %, muscle mass, BMR, InBody scan results)
- Daily nutrition logs (meals, macros, calories)
- Daily hydration logs
- Workout session records and training history
- Progress notes written by their coach
- Goals and injury/medical notes

3.3 Automatically Collected
- Device type and browser information
- Login timestamps and session activity
- App usage patterns (features accessed, frequency)

4. How We Use Your Information
We use collected data to:
- Create and manage your account
- Enable coaches to build and deliver personalized programs to their athletes
- Display real-time training, nutrition, and body composition data
- Process subscription payments and verify renewal transactions
- Send account-related notifications (subscription status, access changes)
- Improve platform performance and fix technical issues
- Ensure platform security and prevent unauthorized access

5. Data Sharing
We do not sell, rent, or trade your personal information to third parties.
We may share data only in the following circumstances:
- Between coach and athlete: Coaches can view and manage their assigned athletes' data. Athletes can view data their coach has configured for them.
- Payment verification: Transaction details submitted for subscription renewal are reviewed by our administrative team for verification purposes only.
- Legal requirements: If required by Egyptian law or a valid legal process, we may disclose information to the appropriate authorities.
- Service providers: We use Supabase as our secure database infrastructure. They process data on our behalf under strict confidentiality obligations.

6. Data Storage & Security
- All data is stored on encrypted cloud servers via Supabase
- Passwords are hashed and never stored in plain text
- Access to athlete data is restricted to their assigned coach only
- Admin access is protected by multi-layer authentication
- Payment receipts and screenshots submitted for verification are deleted immediately after the review process is complete
- We implement industry-standard security practices including SSL/TLS encryption for all data in transit

7. Data Retention
- Active accounts: Data is retained for as long as your account is active
- Deleted accounts: Upon account deletion, all associated records (workouts, nutrition logs, InBody scans, progress notes) are permanently deleted within 7 days
- Payment records: Transaction verification records are retained for 12 months for accounting purposes
- Inactive accounts: Accounts inactive for more than 24 months may be subject to deletion after prior notification

8. Your Rights
You have the right to:
- Access your personal data at any time through your account
- Correct inaccurate information by contacting your coach or our support team
- Delete your account and all associated data by submitting a deletion request
- Export your data upon request (workout history, nutrition logs, InBody records)
- Withdraw consent at any time by deactivating your account

To exercise any of these rights, contact us at the details provided in Section 12.

9. Cookies & Tracking
Life Gym uses minimal browser storage (session tokens) to keep you logged in. We do not use advertising cookies or third-party tracking technologies.

10. Children's Privacy
Life Gym is not intended for users under the age of 16. We do not knowingly collect personal data from minors. If you believe a minor has created an account, please contact us immediately.

11. Changes to This Policy
We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this document. Continued use of the platform after changes constitutes acceptance of the revised policy.`,
        };
      case 'terms':
        return {
          title: 'Terms of Use',
          icon: <FileText className="text-purple-400 w-6 h-6" />,
          isPlainText: true,
          content: `Life Gym Platform
Effective Date: June 6, 2026
Last Updated: June 6, 2026

1. Acceptance of Terms
By creating an account or using the Life Gym platform, you ("User") agree to be bound by these Terms of Use. If you do not agree to these terms, you must not access or use the platform. These terms apply to both coaches and athletes using the Life Gym platform.

2. Description of Service
Life Gym is a subscription-based fitness coaching management platform that provides:
- Athlete management tools for certified fitness coaches
- Personal tracking portals for athletes
- Workout planning, nutrition tracking, and body composition monitoring
- Subscription and license management for coaching businesses

3. Account Registration
3.1 Coaches
- You must provide accurate and complete information during registration
- You are responsible for maintaining the confidentiality of your login credentials
- You must notify us immediately of any unauthorized access to your account
- One coach account is permitted per individual

3.2 Athletes
- Athlete accounts are created by their assigned coach
- Athletes receive login credentials from their coach
- Athletes are responsible for keeping their credentials confidential
- Athletes may not share their account access with others

4. Subscriptions & Payments
4.1 Coach Subscriptions
- Access to the Life Gym coach portal requires an active paid subscription
- Available plans: 2 Weeks, 1 Month, 3 Months, 6 Months
- Subscription pricing is displayed in Egyptian Pounds (EGP) and is subject to change with prior notice
- Subscriptions begin on the activation date confirmed by our team

4.2 Payment Process
- Payments are made via mobile wallet (Vodafone Cash, etc.) or Telda app transfer
- After completing your transfer, you must submit a screenshot receipt through the renewal portal
- Our team will manually verify your payment and activate your subscription within a reasonable time
- Payment verification is conducted by authorized Life Gym administrators only

4.3 Non-Refund Policy
- All payments are strictly non-refundable
- Once a subscription period is activated, no refunds will be issued under any circumstances including but not limited to: unused subscription time, account suspension due to policy violations, or voluntary account deletion
- If your payment is rejected due to invalid verification, you will be notified with the reason and may resubmit

4.4 Subscription Expiry
- When your subscription expires, access to the coach dashboard is automatically suspended
- Your data and athlete records are retained for 30 days after expiry before being subject to deletion
- You may renew your subscription at any time to restore full access

5. Acceptable Use
You agree not to:
- Use the platform for any unlawful purpose or in violation of Egyptian law
- Share, resell, or sublicense your account access to others
- Attempt to reverse engineer, hack, or compromise the platform's security
- Upload false, misleading, or fraudulent payment receipts
- Impersonate another coach, athlete, or Life Gym staff member
- Use the platform to harass, abuse, or harm any other user
- Attempt to access another user's account or data without authorization
- Upload malicious files, scripts, or any content that could harm the platform or its users

6. Coach Responsibilities
As a coach using Life Gym, you are responsible for:
- The accuracy of all athlete data you enter into the platform
- Providing safe, appropriate, and professional fitness guidance to your athletes
- Ensuring your athletes have consented to their data being stored on the platform
- Maintaining professional conduct with all athletes under your management
- Keeping your subscription active to ensure uninterrupted service to your athletes
- Not assigning athletes to inaccurate workout or nutrition programs that could cause harm

Life Gym is a management tool only. We are not responsible for any physical outcomes resulting from training programs or nutritional guidance provided through the platform.

7. Athlete Responsibilities
As an athlete using Life Gym, you are responsible for:
- Following up with your coach regarding your health and fitness progress
- Consulting a medical professional before starting any fitness or nutrition program
- Reporting any injuries or medical conditions to your coach before following any program
- Using the platform only for personal fitness tracking purposes

8. Medical Disclaimer
Life Gym is a fitness management platform and is not a medical service. Nothing on the platform constitutes medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before beginning any exercise or nutrition program, especially if you have pre-existing medical conditions. Life Gym and its coaches are not liable for any injury, illness, or adverse outcome resulting from programs followed through the platform.

9. Intellectual Property
- All platform features, designs, code, and branding belong exclusively to Life Gym
- Users may not copy, reproduce, or distribute any part of the platform without written permission
- Workout plans and nutrition programs created by coaches through the platform remain the intellectual property of the respective coach

10. Account Suspension & Termination
Life Gym reserves the right to suspend or permanently terminate any account at any time for:
- Violation of these Terms of Use
- Fraudulent payment submissions
- Abusive behavior toward other users or staff
- Inactivity exceeding 24 months
- Subscription non-renewal after the grace period

Upon termination for violations, no refund will be issued for any remaining subscription period.

11. Platform Availability
- Life Gym strives to maintain 99% platform uptime but does not guarantee uninterrupted service
- We reserve the right to perform maintenance, updates, or modifications to the platform at any time
- We will make reasonable efforts to notify users of planned downtime in advance
- Life Gym is not liable for losses resulting from platform downtime or technical issues

12. Limitation of Liability
To the fullest extent permitted by applicable law, Life Gym shall not be liable for:
- Any indirect, incidental, or consequential damages arising from platform use
- Loss of data due to technical failures (though we take every precaution to prevent this)
- Physical injury or health outcomes resulting from programs followed through the platform
- Losses resulting from unauthorized account access caused by user negligence

13. Governing Law
These Terms of Use are governed by and construed in accordance with the laws of the Arab Republic of Egypt. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of Egyptian courts.

14. Changes to Terms
We reserve the right to modify these Terms of Use at any time. Changes will be effective upon posting the updated terms with a revised date. Continued use of the platform after changes constitutes your acceptance of the new terms. We recommend reviewing this document periodically.`,
        };
      case 'cookies':
        return {
          title: 'Cookie & Storage Policy',
          icon: <Cookie className="text-amber-400 w-6 h-6" />,
          isPlainText: false,
          sections: [
            {
              title: '1. LocalStorage & Authentication Cookies',
              icon: <Cookie size={16} className="text-amber-400" />,
              content: 'We use localStorage to securely persist your Supabase user session token. This prevents you from being logged out every time you close the tab or browser, ensuring a seamless experience.',
            },
            {
              title: '2. PWA Caching & Performance',
              icon: <Cookie size={16} className="text-amber-400" />,
              content: 'As a Progressive Web App (PWA), we cache app assets (CSS, JS, icons) and offline targets locally. This allows the application to load instantly, work under poor network conditions, and preserve battery life.',
            },
            {
              title: '3. Zero Third-Party Tracking',
              icon: <Shield size={16} className="text-amber-400" />,
              content: 'We respect your privacy. We do not use third-party cookies, advertising tracking pixels, or data collection scripts that follow you across the web. All stored local data is strictly functional and necessary for app operations.',
            },
          ],
        };
    }
  };

  const details = getContent();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-[420px] max-h-[85vh] bg-[#0c0e15] border border-gray-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 bg-[#121620]/80 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            {details.icon}
            <h3 className="font-extrabold text-white text-md tracking-tight uppercase">
              {details.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar select-text text-sm text-left">
          {details.isPlainText ? (
            <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line text-left pl-0 max-w-none font-sans select-text">
              {details.content}
            </div>
          ) : (
            details.sections?.map((sec, idx) => (
              <div key={idx} className="space-y-1.5">
                <h4 className="font-bold text-gray-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  {sec.icon}
                  {sec.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed pl-5">
                  {sec.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#0d0f17] flex justify-end sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
