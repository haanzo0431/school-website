import './globals.css';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'Xonqa Tuman Maktab Platform',
  description: 'School platform for news, press, and student clubs.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('app-theme') || 'night';
                  document.documentElement.setAttribute('data-theme', savedTheme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased flex min-h-screen theme-bg-page theme-text-primary">
        <Navbar />
        <div className="flex-1 min-w-0 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}