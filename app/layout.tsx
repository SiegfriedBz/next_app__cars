import { getServerSession } from 'next-auth'
import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/context/SessionProvider'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { authOptions } from '@/utils/authOptions'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const roboto = Roboto({
  weight: ['100', '300', '400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang='en' className='scroll-smooth'>
      <body className={roboto.className}>
        <SessionProvider session={session}>
          <Navbar />
          {children}
          <Footer />
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  )
}
