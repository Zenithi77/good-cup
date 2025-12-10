'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-coffee-800 mb-8">Үйлчилгээний нөхцөл</h1>

          <div className="prose prose-coffee max-w-none space-y-6 text-coffee-700">
            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">1. Ерөнхий зүйл</h2>
              <p>
                Good Cup вэбсайтыг ашигласнаар та эдгээр үйлчилгээний нөхцөлийг зөвшөөрч байна. 
                Бид цаасан аяга, таг, соруул зэрэг бүтээгдэхүүнийг бөөний болон жижиглэнгийн үнээр нийлүүлдэг.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">2. Захиалга</h2>
              <p>
                Захиалга өгөхийн тулд та бүртгүүлж, нэвтрэх шаардлагатай. Захиалгын мэдээллийг үнэн зөв оруулах нь таны хариуцлага юм.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">3. Төлбөр</h2>
              <p>
                Төлбөрийг банкны шилжүүлгээр хийнэ. Захиалга баталгаажсаны дараа төлбөр буцаагдахгүй.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">4. Хүргэлт</h2>
              <p>
                Улаанбаатар хотод 24-48 цагийн дотор хүргэнэ. Орон нутагт 3-5 хоногт хүргэнэ.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">5. Буцаалт</h2>
              <p>
                Бүтээгдэхүүн гэмтэлтэй ирсэн тохиолдолд 24 цагийн дотор мэдэгдэж, солиулах боломжтой.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-coffee-800 mb-3">6. Холбоо барих</h2>
              <p>
                Асуулт байвал info@goodcup.mn хаягаар холбогдоно уу.
              </p>
            </section>
          </div>

          <p className="text-sm text-coffee-400 mt-8">
            Сүүлд шинэчилсэн: 2025 оны 12-р сар
          </p>
        </motion.div>
      </div>
    </div>
  );
}
