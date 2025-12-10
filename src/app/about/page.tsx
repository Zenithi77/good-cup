'use client';

import { Coffee, Heart, Leaf, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const features = [
    {
      icon: Coffee,
      title: 'Чанартай кофе',
      description: 'Бид зөвхөн дэлхийн шилдэг кофены үрийг сонгон ашигладаг.'
    },
    {
      icon: Leaf,
      title: 'Байгальд ээлтэй',
      description: 'Тогтвортой хөгжлийг дэмжиж, байгаль орчныг хамгаална.'
    },
    {
      icon: Heart,
      title: 'Хайраар хийсэн',
      description: 'Бүх бүтээгдэхүүнээ хайр сэтгэлээрээ бэлтгэдэг.'
    },
    {
      icon: Users,
      title: 'Хамт олон',
      description: 'Кофе сонирхогчдын нийгэмлэгт тавтай морил.'
    }
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="relative bg-coffee-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Good Cup-ийн тухай
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-coffee-100 max-w-2xl mx-auto"
          >
            Бид 2020 оноос хойш Монголын кофе соёлыг хөгжүүлэхийн төлөө ажиллаж байна.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-coffee-800 mb-6">Бидний түүх</h2>
            <p className="text-coffee-600 leading-relaxed mb-6">
              Good Cup нь кофенд хайртай хэсэг залуусын санаачилгаар үүссэн. Бид дэлхийн өнцөг 
              булан бүрээс шилдэг кофены үрийг сонгож, Монголын хэрэглэгчдэд хүргэхийг зорьдог.
            </p>
            <p className="text-coffee-600 leading-relaxed">
              Манай зорилго бол чанартай кофег хүн бүрт хүртээмжтэй үнээр санал болгох юм. 
              Бид бөөний болон жижиглэнгийн худалдаа хоёуланг нь эрхэлдэг бөгөөд таны хэрэгцээнд 
              тохирсон үйлчилгээг үзүүлэхэд бэлэн байна.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-coffee-800 text-center mb-12">Бидний онцлог</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-coffee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-coffee-600" />
                </div>
                <h3 className="text-lg font-semibold text-coffee-800 mb-2">{feature.title}</h3>
                <p className="text-coffee-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-coffee-800 mb-6">Холбоо барих</h2>
          <div className="space-y-2 text-coffee-600">
            <p>📍 Улаанбаатар хот, Сүхбаатар дүүрэг</p>
            <p>📞 +976 9999 9999</p>
            <p>✉️ info@goodcup.mn</p>
          </div>
        </div>
      </section>
    </div>
  );
}
