const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

async function scrapeArticles() {
  try {
    const { data } = await axios.get('https://news.ycombinator.com/news');
    const $ = cheerio.load(data);

    const articles = [];
    $('td.title').each((i, el) => {
      const title = $(el).find('a').text().trim();
      const link = $(el).find('a').attr('href');
      if (title && link) {
        articles.push({ title, link });
      }
    });

    // Сохраняем данные в JSON файл
    await fs.writeJson('articles.json', articles, { spaces: 2 });
    console.log('Articles saved to articles.json');
  } catch (error) {
    console.error('Error scraping articles:', error.message);
  }
}

scrapeArticles();