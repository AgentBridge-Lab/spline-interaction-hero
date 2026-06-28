import "./globals.css";

export const metadata = {
  title: "Spline Hero Entry",
  description: "A clean Spline hero splash that opens a simple web page on click.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
