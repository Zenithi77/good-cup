import nodemailer from 'nodemailer';
import { Order, OrderItem } from '@/types';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Format price helper
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('mn-MN').format(price) + '₮';
};

// Format date helper
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Generate order success email HTML template
export const generateOrderSuccessEmailHTML = (order: Order): string => {
  const orderItemsHTML = order.items
    .map(
      (item: OrderItem) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #e5d5c5;">
          <div style="display: flex; align-items: center;">
            <img 
              src="${item.imageUrl || 'https://via.placeholder.com/80x80?text=☕'}" 
              alt="${item.productName}"
              style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover; margin-right: 16px;"
            />
            <div>
              <p style="margin: 0; font-weight: 600; color: #3d2516; font-size: 16px;">${item.productName}</p>
              <p style="margin: 4px 0 0 0; color: #8b7355; font-size: 14px;">Хэмжээ: ${item.size}</p>
            </div>
          </div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5d5c5; text-align: center; color: #3d2516;">
          ${item.quantity}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #e5d5c5; text-align: right; color: #3d2516; font-weight: 600;">
          ${formatPrice(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Захиалга амжилттай!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f0eb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3d2516 0%, #5c3a28 100%); border-radius: 20px 20px 0 0; padding: 40px 30px; text-align: center;">
      <div style="background: #f5f0eb; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 40px;">☕</span>
      </div>
      <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: 700;">GOOD CUP</h1>
      <p style="color: #d4c4b0; margin: 10px 0 0 0; font-size: 14px;">Чанартай сав баглаа боодол</p>
    </div>

    <!-- Success Message -->
    <div style="background: #fff; padding: 40px 30px; text-align: center; border-bottom: 1px solid #e5d5c5;">
      <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); width: 70px; height: 70px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="color: #fff; font-size: 36px;">✓</span>
      </div>
      <h2 style="color: #3d2516; margin: 0 0 10px 0; font-size: 24px;">Таны захиалга амжилттай!</h2>
      <p style="color: #8b7355; margin: 0; font-size: 16px; line-height: 1.6;">
        Баярлалаа! Таны захиалга амжилттай баталгаажлаа.<br>
        Бид захиалгыг таньд хүргэхэд бэлэн байна.
      </p>
    </div>

    <!-- Order Info -->
    <div style="background: #fff; padding: 30px; border-bottom: 1px solid #e5d5c5;">
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
        <div style="flex: 1; min-width: 200px;">
          <p style="color: #8b7355; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Захиалгын дугаар</p>
          <p style="color: #3d2516; margin: 0; font-size: 18px; font-weight: 700;">#${order.id.slice(-8).toUpperCase()}</p>
        </div>
        <div style="flex: 1; min-width: 200px;">
          <p style="color: #8b7355; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Огноо</p>
          <p style="color: #3d2516; margin: 0; font-size: 16px;">${formatDate(new Date(order.createdAt))}</p>
        </div>
      </div>
    </div>

    <!-- Customer Info -->
    <div style="background: #faf7f4; padding: 25px 30px; border-bottom: 1px solid #e5d5c5;">
      <h3 style="color: #3d2516; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center;">
        <span style="margin-right: 10px;">👤</span> Хэрэглэгчийн мэдээлэл
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #8b7355; width: 120px;">Нэр:</td>
          <td style="padding: 8px 0; color: #3d2516; font-weight: 500;">${order.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8b7355;">Утас:</td>
          <td style="padding: 8px 0; color: #3d2516; font-weight: 500;">${order.customerPhone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8b7355;">И-мэйл:</td>
          <td style="padding: 8px 0; color: #3d2516; font-weight: 500;">${order.customerEmail}</td>
        </tr>
      </table>
    </div>

    <!-- Delivery Info -->
    <div style="background: #fff; padding: 25px 30px; border-bottom: 1px solid #e5d5c5;">
      <h3 style="color: #3d2516; margin: 0 0 15px 0; font-size: 16px; display: flex; align-items: center;">
        <span style="margin-right: 10px;">📍</span> Хүргэлтийн хаяг
      </h3>
      <p style="color: #3d2516; margin: 0; line-height: 1.6;">
        <strong>${order.deliveryDistrict}</strong><br>
        ${order.deliveryAddress}
      </p>
      ${order.notes ? `<p style="color: #8b7355; margin: 15px 0 0 0; font-style: italic; font-size: 14px;">📝 Тэмдэглэл: ${order.notes}</p>` : ''}
    </div>

    <!-- Order Items -->
    <div style="background: #fff; padding: 25px 30px;">
      <h3 style="color: #3d2516; margin: 0 0 20px 0; font-size: 16px; display: flex; align-items: center;">
        <span style="margin-right: 10px;">📦</span> Захиалсан бүтээгдэхүүн
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #faf7f4;">
            <th style="padding: 12px 16px; text-align: left; color: #8b7355; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5d5c5;">Бүтээгдэхүүн</th>
            <th style="padding: 12px 16px; text-align: center; color: #8b7355; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5d5c5;">Тоо</th>
            <th style="padding: 12px 16px; text-align: right; color: #8b7355; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5d5c5;">Үнэ</th>
          </tr>
        </thead>
        <tbody>
          ${orderItemsHTML}
        </tbody>
      </table>
    </div>

    <!-- Order Total -->
    <div style="background: linear-gradient(135deg, #faf7f4 0%, #f5f0eb 100%); padding: 25px 30px; border-top: 2px solid #e5d5c5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #8b7355;">Бүтээгдэхүүний дүн:</td>
          <td style="padding: 8px 0; color: #3d2516; text-align: right;">${formatPrice(order.total)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #8b7355;">Хүргэлт:</td>
          <td style="padding: 8px 0; color: #22c55e; text-align: right; font-weight: 500;">Үнэгүй</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 15px 0 0 0;">
            <div style="border-top: 2px dashed #d4c4b0; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #3d2516; font-size: 18px; font-weight: 700;">Нийт дүн:</span>
              <span style="color: #3d2516; font-size: 24px; font-weight: 700;">${formatPrice(order.total)}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Payment Status -->
    <div style="background: #fff; padding: 25px 30px; text-align: center; border-bottom: 1px solid #e5d5c5;">
      <div style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #fff; padding: 12px 30px; border-radius: 30px; font-weight: 600;">
        ✓ Төлбөр төлөгдсөн
      </div>
      ${order.paymentRef ? `<p style="color: #8b7355; margin: 15px 0 0 0; font-size: 14px;">Гүйлгээний код: <strong style="color: #3d2516;">${order.paymentRef}</strong></p>` : ''}
    </div>

    <!-- Delivery Info Box -->
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px 30px; margin: 20px 0; border-radius: 12px; text-align: center;">
      <span style="font-size: 32px; display: block; margin-bottom: 10px;">🚚</span>
      <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">Хүргэлтийн мэдээлэл</h4>
      <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">
        Таны захиалгыг ажлын өдрүүдэд <strong>10:00 - 18:00</strong> цагийн хооронд хүргэнэ.<br>
        Хүргэлт хийхээс өмнө бид тантай утсаар холбогдоно.
      </p>
    </div>

    <!-- Contact Section -->
    <div style="background: #fff; padding: 25px 30px; text-align: center; border-radius: 12px; margin-bottom: 20px;">
      <h4 style="color: #3d2516; margin: 0 0 15px 0; font-size: 16px;">Асуулт байна уу?</h4>
      <p style="color: #8b7355; margin: 0 0 15px 0; font-size: 14px;">Бидэнтэй холбогдоно уу</p>
      <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
        <a href="tel:+97699119911" style="color: #3d2516; text-decoration: none; display: flex; align-items: center; gap: 8px;">
          <span>📞</span> +976 9911 9911
        </a>
        <a href="mailto:info@goodcup.mn" style="color: #3d2516; text-decoration: none; display: flex; align-items: center; gap: 8px;">
          <span>📧</span> info@goodcup.mn
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: linear-gradient(135deg, #3d2516 0%, #5c3a28 100%); border-radius: 0 0 20px 20px; padding: 30px; text-align: center;">
      <p style="color: #d4c4b0; margin: 0 0 10px 0; font-size: 14px;">
        Биднийг сонгосонд баярлалаа!
      </p>
      <p style="color: #8b7355; margin: 0; font-size: 12px;">
        © ${new Date().getFullYear()} GOOD CUP. Бүх эрх хуулиар хамгаалагдсан.
      </p>
      <div style="margin-top: 20px; display: flex; justify-content: center; gap: 15px;">
        <a href="#" style="color: #d4c4b0; text-decoration: none; font-size: 20px;">📘</a>
        <a href="#" style="color: #d4c4b0; text-decoration: none; font-size: 20px;">📸</a>
        <a href="#" style="color: #d4c4b0; text-decoration: none; font-size: 20px;">🐦</a>
      </div>
    </div>

    <!-- Legal -->
    <p style="color: #8b7355; font-size: 11px; text-align: center; margin: 20px 0 0 0; line-height: 1.6;">
      Энэ мэйл нь GOOD CUP-ээс автоматаар илгээгдсэн болно.<br>
      Хэрэв та энэ захиалгыг хийгээгүй бол бидэнтэй холбогдоно уу.
    </p>

  </div>
</body>
</html>
  `;
};

// Send order success email
export const sendOrderSuccessEmail = async (order: Order): Promise<boolean> => {
  try {
    const mailOptions = {
      from: {
        name: 'GOOD CUP',
        address: process.env.EMAIL_USER!,
      },
      to: order.customerEmail,
      subject: `☕ Захиалга амжилттай! #${order.id.slice(-8).toUpperCase()} - GOOD CUP`,
      html: generateOrderSuccessEmailHTML(order),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order success email sent to ${order.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending order success email:', error);
    return false;
  }
};
