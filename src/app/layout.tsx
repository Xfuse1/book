import BackgroundParticles from '@/components/BackgroundParticles'

import './globals.css'

export const metadata = {
  title: 'خبير البرومبتات | كتابك نحو الاحتراف',
  description: 'تعلم فن صياغة الأوامر الذكية وبناء تطبيقاتك الخاصة',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <BackgroundParticles />


        <div style={{ paddingTop: 'var(--header-h, 0px)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
