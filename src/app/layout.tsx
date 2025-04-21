import './globals.css';
import '../../styled-system/styles.css';  // Import Panda CSS global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
// This layout loads the global styles including PandaCSS styles.