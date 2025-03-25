// app/layout.jsx
import './globals.css'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Providers } from './providers'
import UserDataSync from '../components/UserDataSync'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'Bike Booking App',
  description: 'Book bikes easily with our user-friendly application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {/* Add UserDataSync component to sync user data with Convex */}
          <UserDataSync />
          {children}
          <ToastContainer position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}