import './globals.css';

export const metadata = {
  title: 'Xonqa Tuman Maktab Platform',
  description: 'Official school platform for Xonqa district',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}