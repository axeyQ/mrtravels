// app/layout.jsx
import './globals.css'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Providers } from './providers'
import UserDataSync from '../components/UserDataSync'
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'ZipBikes by MR Travels and Rental Services',
  description: 'Book bikes easily with our user-friendly application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
      <Analytics/>
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