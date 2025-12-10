import Link from 'next/link';
import { Coffee, Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-coffee-950 border-t border-coffee-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Coffee className="w-8 h-8 text-coffee-400" />
              <span className="text-xl font-bold text-coffee-100">Good Cup</span>
            </Link>
            <p className="text-coffee-400 text-sm">
              Чанартай цаасан аяга, таг, соруулыг бөөний үнээр нийлүүлнэ.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-coffee-800 text-coffee-400 hover:text-coffee-100 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-coffee-800 text-coffee-400 hover:text-coffee-100 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-coffee-100 font-semibold mb-4">Түргэн холбоос</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-coffee-400 hover:text-coffee-200 text-sm">
                  Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-coffee-400 hover:text-coffee-200 text-sm">
                  Миний захиалга
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-coffee-400 hover:text-coffee-200 text-sm">
                  Бидний тухай
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-coffee-100 font-semibold mb-4">Ангилал</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=double-wall-cup" className="text-coffee-400 hover:text-coffee-200 text-sm">
                  Давхар цаастай аяга
                </Link>
              </li>
              <li>
                <Link href="/products?category=single-wall-cup" className="text-coffee-400 hover:text-coffee-200 text-sm">
                  Дан цаастай аяга
                </Link>
              </li>
              <li>
                <Link href="/products?category=cold-cup" className="text-coffee-400 hover:text-coffee-200 text-sm">
                  Хүйтэн уух аяга
                </Link>
              </li>
              <li>
                <Link href="/products?category=straw" className="text-coffee-400 hover:text-coffee-200 text-sm">
                  Соруул
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-coffee-100 font-semibold mb-4">Холбоо барих</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-coffee-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>9911-1234</span>
              </li>
              <li className="flex items-center space-x-3 text-coffee-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@goodcup.mn</span>
              </li>
              <li className="flex items-start space-x-3 text-coffee-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Улаанбаатар хот, Сүхбаатар дүүрэг</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-coffee-800 text-center">
          <p className="text-coffee-500 text-sm">
            © {new Date().getFullYear()} Good Cup. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </div>
    </footer>
  );
}
