const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Страница для загрузки файла
app.get('/', (req, res) => {
  res.send(`
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button>Upload</button>
    </form>
  `);
});

// Обработка загрузки файла
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }
  res.send(`File uploaded successfully: ${file.filename}`);
});

// Сервинг загруженных файлов
app.use('/files', express.static(path.join(__dirname, 'uploads')));

// Страница для просмотра всех загруженных файлов
app.get('/files', (req, res) => {
  const files = fs.readdirSync('uploads/');
  let fileList = '<ul>';
  files.forEach((file) => {
    fileList += `<li><a href="/files/${file}">${file}</a></li>`;
  });
  fileList += '</ul>';
  res.send(fileList);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));