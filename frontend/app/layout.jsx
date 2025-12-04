import './globals.css'
import { Inter } from 'next/font/google'
import AuthProvider from '../contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TaskFlow Pro',
  description: 'Workflow automation and AI assistant for modern teams.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
