export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-green-700"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
