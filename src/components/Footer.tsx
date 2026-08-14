export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm">
            © {new Date().getFullYear()} Radha Soami Satsang Beas – Loni Centre
          </p>
          <p className="text-xs text-gray-400 mt-1 sm:mt-0">
            Bhati Jatha Vehicle Entry & Sewadar Management System
          </p>
        </div>
      </div>
    </footer>
  );
}
