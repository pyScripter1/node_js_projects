const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Модель для хранения ссылок
const LinkSchema = new mongoose.Schema({
  originalUrl: String,
  shortId: String,
  createdAt: { type: Date, default: Date.now },
});

const Link = mongoose.model('Link', LinkSchema);

// Генерация QR-кода
async function generateQRCode(shortUrl) {
  try {
    const qrCode = await QRCode.toDataURL(shortUrl);
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error.message);
  }
}

// Роут для создания короткой ссылки
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  // Проверяем, существует ли уже такая ссылка
  let link = await Link.findOne({ originalUrl });
  if (link) {
    return res.send({ shortUrl: `${process.env.BASE_URL}/${link.shortId}`, qrCode: await generateQRCode(`${process.env.BASE_URL}/${link.shortId}`) });
  }

  // Создаем новую короткую ссылку
  const shortId = shortid.generate();
  link = new Link({ originalUrl, shortId });
  await link.save();

  res.send({ shortUrl: `${process.env.BASE_URL}/${shortId}`, qrCode: await generateQRCode(`${process.env.BASE_URL}/${shortId}`) });
});

// Роут для перенаправления по короткой ссылке
app.get('/:shortId', async (req, res) => {
  const link = await Link.findOne({ shortId: req.params.shortId });
  if (!link) {
    return res.status(404).send('Short link not found');
  }
  res.redirect(link.originalUrl);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));