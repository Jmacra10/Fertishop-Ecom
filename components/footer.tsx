import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-green-50">
      <div className="container px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-lg font-bold text-green-800">FertiShop</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-green-200 flex justify-center">
          <p className="text-xs text-green-700">
            &copy; {new Date().getFullYear()} FertiShop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
