import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 via-white to-indigo-100 py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-lg w-full space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Welcome to Our Food Ordering App</h1>
          <p className="mt-4 text-lg text-gray-700">Get your favorite meals delivered fast and fresh</p>
        </div>
        <div className="space-y-8">
          <div className="rounded-lg shadow-lg">
            <Link
              href="/menu"
              className="w-full flex items-center justify-center px-10 py-4 text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Explore Our Menu
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-indigo-100 text-gray-500">Or continue below</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/login"
              className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-lg shadow text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 rounded-lg shadow text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
