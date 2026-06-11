import Link from 'next/link';
import { Coffee, Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-coffee-900 to-coffee-950 border-t border-coffee-800">
      {/* Brand accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-coffee-500 to-transparent" />
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Coffee className="w-8 h-8 text-coffee-400 transition-transform duration-300 group-hover:-rotate-12" />
              <span className="text-xl font-bold text-coffee-100">Good Cup</span>
            </Link>
            <p className="text-coffee-400 text-sm leading-relaxed">
              Чанартай цаасан аяга, таг, соруулыг бөөний үнээр нийлүүлнэ.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.facebook.com/profile.php?id=100075917394135"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-coffee-800 text-coffee-400 hover:text-white hover:bg-coffee-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/cood_cup_coffee/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-coffee-800 text-coffee-400 hover:text-white hover:bg-coffee-600 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-coffee-100 font-semibold mb-4 text-sm uppercase tracking-wider">Түргэн холбоос</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products" className="text-coffee-400 hover:text-coffee-200 text-sm inline-block hover:translate-x-1 transition-all duration-200">
                  Бүтээгдэхүүн
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-coffee-400 hover:text-coffee-200 text-sm inline-block hover:translate-x-1 transition-all duration-200">
                  Миний захиалга
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-coffee-400 hover:text-coffee-200 text-sm inline-block hover:translate-x-1 transition-all duration-200">
                  Бидний тухай
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-coffee-100 font-semibold mb-4 text-sm uppercase tracking-wider">Ангилал</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products?category=double-wall-cup" className="text-coffee-400 hover:text-coffee-200 text-sm inline-block hover:translate-x-1 transition-all duration-200">
                  Давхар цаастай аяга
                </Link>
              </li>
              <li>
                <Link href="/products?category=single-wall-cup" className="text-coffee-400 hover:text-coffee-200 text-sm inline-block hover:translate-x-1 transition-all duration-200">
                  Дан цаастай аяга
                </Link>
              </li>
              <li>
                <Link href="/products?category=cold-cup" className="text-coffee-400 hover:text-coffee-200 text-sm inline-block hover:translate-x-1 transition-all duration-200">
                  Хүйтэн уух аяга
                </Link>
              </li>
              <li>
                <Link href="/products?category=straw" className="text-coffee-400 hover:text-coffee-200 text-sm inline-block hover:translate-x-1 transition-all duration-200">
                  Соруул
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-coffee-100 font-semibold mb-4 text-sm uppercase tracking-wider">Холбоо барих</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-coffee-400 text-sm">
                <Phone className="w-4 h-4" />
                <a href="tel:89990788" className="hover:text-coffee-200">89990788</a>
              </li>
              <li className="flex items-center space-x-3 text-coffee-400 text-sm">
                <Mail className="w-4 h-4" />
                <a href="mailto:Speedlinedevelopment@gmail.com" className="hover:text-coffee-200">Speedlinedevelopment@gmail.com</a>
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
