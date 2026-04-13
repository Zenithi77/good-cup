'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center text-coffee-500 hover:text-coffee-600 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Буцах
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-coffee-800 mb-8">Нууцлалын бодлого</h1>

          <div className="prose prose-coffee max-w-none space-y-6 text-coffee-700">
            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">1. Ерөнхий зүйл</h2>
              <p>
                Good Cup нь хэрэглэгчдийн хувийн мэдээллийг хамгаалах, зөвхөн захиалга гүйцэтгэх 
                зорилгоор ашиглах бодлогыг баримталдаг.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">2. Цуглуулдаг мэдээлэл</h2>
              <p>Бид дараах мэдээллийг цуглуулдаг:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Нэр, утасны дугаар, и-мэйл хаяг</li>
                <li>Хүргэлтийн хаяг (дүүрэг/аймаг, сум, дэлгэрэнгүй хаяг)</li>
                <li>Захиалгын түүх, төлбөрийн мэдээлэл</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">3. Мэдээллийн ашиглалт</h2>
              <p>Таны мэдээллийг зөвхөн дараах зорилгоор ашигладаг:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Захиалга боловсруулах, хүргэлт хийх</li>
                <li>Төлбөр баталгаажуулах</li>
                <li>Захиалгын талаар мэдэгдэл илгээх</li>
                <li>Үйлчилгээг сайжруулах</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">4. Мэдээллийн хамгаалалт</h2>
              <p>
                Бид таны мэдээллийг зөвшөөрөлгүй нэвтрэх, алдах, өөрчлөхөөс хамгаалахын тулд 
                найдвартай баталгаажуулалт болон шифрлэлтийн аргуудыг ашигладаг.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">5. Гуравдагч талд мэдээлэл дамжуулах</h2>
              <p>
                Бид таны хувийн мэдээллийг гуравдагч талд зарахгүй. Зөвхөн төлбөрийн үйлчилгээ 
                үзүүлэгч (Byl.mn) болон хүргэлтийн үйлчилгээнд шаардлагатай мэдээллийг дамжуулдаг.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">6. Cookies</h2>
              <p>
                Манай вэбсайт нь хэрэглэгчийн тохиргоо, сагсны мэдээллийг хадгалахад cookies ашигладаг. 
                Та хөтчийнхөө тохиргооноос cookies-г идэвхгүй болгох боломжтой.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">7. Хэрэглэгчийн эрх</h2>
              <p>Та дараах эрхтэй:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Өөрийн мэдээллийг үзэх, засах</li>
                <li>Бүртгэлээ устгуулах хүсэлт гаргах</li>
                <li>Мэдэгдэл хүлээн авахаас татгалзах</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">8. Холбоо барих</h2>
              <p>
                Нууцлалын бодлоготой холбоотой асуулт байвал info@goodcup.mn хаягаар холбогдоно уу.
              </p>
            </section>
          </div>

          <p className="text-sm text-coffee-500 mt-8">
            Сүүлд шинэчилсэн: 2026 оны 4-р сар
          </p>
        </motion.div>
      </div>
    </div>
  );
}
