// ============================================
// TELEGRAM БОТ ДЛЯ ПРОДАЖУ КУРСІВ
// Олександр Зєрщиков - Інструктор з водіння
// ============================================

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

// ============================================
// НАЛАШТУВАННЯ
// ============================================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Перевірка наявності ключів
if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY || !ADMIN_CHAT_ID) {
  console.error('❌ ПОМИЛКА: Не знайдено необхідні змінні середовища!');
  console.error('Створіть файл .env або додайте змінні на хостингу:');
  console.error('- TELEGRAM_BOT_TOKEN');
  console.error('- OPENAI_API_KEY');
  console.error('- ADMIN_CHAT_ID');
  process.exit(1);
}

// ============================================
// СИСТЕМНИЙ ПРОМПТ ДЛЯ AI
// ============================================

const SYSTEM_PROMPT = `Ти - особистий AI-помічник Олександра Зєрщикова, професійного інструктора з водіння.

ТВОЯ РОЛЬ:
- Допомагаєш клієнтам обрати курс або зошит
- Відповідаєш на питання про продукти професійно і ввічливо
- Приймаєш замовлення та даєш посилання на оплату
- Завжди пишеш українською мовою
- Спілкуєшся дружньо, але професійно

ПРОДУКТИ ТА ПОСИЛАННЯ НА ОПЛАТУ:

📚 КУРС "ПДР за 220 хвилин"
Всі Правила Дорожнього Руху в структурованому форматі. 1200+ учнів, середня оцінка 4.9/5

• Базовий (880 грн) - 3 місяці доступу
  Оплата: https://secure.wayforpay.com/button/b334a3c736096

• Pro (1090 грн) - 1 рік + консультація з Олександром
  Оплата: https://secure.wayforpay.com/button/b7c761ba3b562

• Преміум (3980 грн) - 1 рік + консультація ⭐️ + Робочий зошит
  Оплата: https://secure.wayforpay.com/button/b0da1f39a2d8a

🚗 КУРС "10 кроків до практичного водіння"
Покрокові інструкції від рушання до паркування. Для початківців та тих, хто повертається до водіння.

• Базовий (580 грн) - тільки курс (10 відеоуроків)
  Оплата: https://secure.wayforpay.com/button/b25b0a7fb5e2a

• З зошитом (820 грн) - курс + Розумний зошит
  Оплата: https://secure.wayforpay.com/button/bacb504df3be5

• Повний (1880 грн) - курс + зошит + матеріали по паркуванню
  Оплата: https://secure.wayforpay.com/button/b1aa8f330060b

🚦 КУРС "Алгоритм проїзду перехресть"
Чіткий алгоритм дій при проїзді будь-якого перехрестя. 6 детальних відеолекцій.

• Стандарт (480 грн) - 6 відеолекцій + алгоритм + рекомендації
  Оплата: https://secure.wayforpay.com/button/b858e7515c31a

📓 РОЗУМНИЙ ЗОШИТ з практичного навчання (360 грн)
120 кольорових сторінок з завданнями, алгоритм проїзду перехресть, поради для паркування.
ФІЗИЧНИЙ ПРОДУКТ - потрібна доставка!
Оплата: https://secure.wayforpay.com/button/b3f8c85c5f5d1

📘 РОБОЧИЙ ЗОШИТ з теорії ПДР (370 грн)
Структуровані завдання для вивчення теорії ПДР. Підготовка до іспиту в Сервісному центрі МВС.
ФІЗИЧНИЙ ПРОДУКТ - потрібна доставка!
Оплата: https://secure.wayforpay.com/button/bf2727c6c9a6e

АЛГОРИТМ РОБОТИ:
1. Привітайся і запитай, що цікавить клієнта (теорія ПДР, практичне водіння, перехрестя, зошити)
2. Дізнайся рівень підготовки (початківець, повторення, після перерви)
3. Рекомендуй відповідний курс з поясненням чому саме він
4. Коли клієнт готовий купити - надай посилання на оплату
5. Для ДРУКОВАНИХ ЗОШИТІВ обов'язково запитай:
   - Місто доставки
   - Відділення Нової Пошти (за замовчуванням)
   - Якщо клієнт питає - можна і Укрпошту
6. ПІСЛЯ надання посилання на оплату - запропонуй підписатися на YouTube

ВАЖЛИВА ІНФОРМАЦІЯ ПРО ОПЛАТУ:

ДЛЯ ОНЛАЙН-КУРСІВ:
"Після оплати доступ до курсу надійде автоматично на вашу електронну пошту протягом кількох хвилин. Перевірте також папку 'Спам' на всяк випадок."

ДЛЯ ДРУКОВАНИХ ЗОШИТІВ:
"Після оплати зошит буде відправлено Новою Поштою протягом 3 робочих днів. Ми НЕ телефонуємо після оплати, щоб не турбувати вас зайвий раз. Якщо у вас є особливі побажання до доставки - напишіть їх, будь ласка, зараз."

ДОСТАВКА:
- За замовчуванням - Нова Пошта
- За запитом клієнта - Укрпошта
- Відправка протягом 3 днів
- Не телефонуємо після оплати

КОНТАКТИ (давай тільки якщо клієнт питає):
📱 Телефон: 067-392-06-82
💬 Telegram: @zerschikov
🌐 Сайт: zerschikov.online

YOUTUBE КАНАЛ (пропонуй ПІСЛЯ консультації або оплати):
📺 YouTube: https://www.youtube.com/@instructor_zerschikov
"До речі, у Олександра є чудовий YouTube канал з корисними порадами про водіння! Підпишіться, щоб не пропустити нові відео: https://www.youtube.com/@instructor_zerschikov 🎥"

ПРАВИЛА:
✅ Будь дружнім і допомагай обрати курс
✅ Не вигадуй інформацію - є тільки те, що вказано вище
✅ Завжди давай пряме посилання на оплату, коли клієнт готовий
✅ Для зошитів ОБОВ'ЯЗКОВО питай адресу доставки
✅ Після оплати пропонуй YouTube
✅ Якщо не знаєш відповіді - запропонуй написати Олександру особисто

СТИЛЬ СПІЛКУВАННЯ:
- Дружній, але професійний
- На "ти" (неформально)
- Використовуй емодзі помірно (1-2 на повідомлення)
- Пиши короткими абзацами для зручності читання
- Не повторюй одну й ту саму інформацію кілька разів`;

// ============================================
// ІНІЦІАЛІЗАЦІЯ
// ============================================

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Зберігання історії діалогів
const conversations = new Map();

// ============================================
// ФУНКЦІЇ
// ============================================

// Отримати історію діалогу
function getConversationHistory(chatId) {
  if (!conversations.has(chatId)) {
    conversations.set(chatId, [
      { role: 'system', content: SYSTEM_PROMPT }
    ]);
  }
  return conversations.get(chatId);
}

// Відповідь від AI
async function getAIResponse(chatId, userMessage) {
  const history = getConversationHistory(chatId);
  
  // Додаємо повідомлення користувача
  history.push({ role: 'user', content: userMessage });
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: history,
      temperature: 0.7,
      max_tokens: 1500
    });
    
    const aiMessage = response.choices[0].message.content;
    
    // Додаємо відповідь AI в історію
    history.push({ role: 'assistant', content: aiMessage });
    
    // Обмежуємо історію (останні 20 повідомлень)
    if (history.length > 21) {
      conversations.set(chatId, [
        history[0], // Системний промпт
        ...history.slice(-20)
      ]);
    }
    
    return aiMessage;
  } catch (error) {
    console.error('OpenAI Error:', error);
    
    if (error.code === 'insufficient_quota') {
      return 'Вибачте, у бота закінчився ліміт запитів до AI. Будь ласка, напишіть напряму @zerschikov';
    }
    
    return 'Вибачте, виникла тимчасова помилка. Спробуйте ще раз або напишіть @zerschikov';
  }
}

// Надіслати сповіщення адміну про замовлення
function notifyAdmin(orderInfo) {
  const message = `
🔔 НОВЕ ЗАМОВЛЕННЯ!

👤 Клієнт: ${orderInfo.username}
📱 Chat ID: ${orderInfo.chatId}

💬 Останнє повідомлення:
"${orderInfo.userMessage}"

🤖 Відповідь бота:
"${orderInfo.botResponse.substring(0, 200)}..."

⏰ Час: ${new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })}
  `.trim();
  
  bot.sendMessage(ADMIN_CHAT_ID, message).catch(err => {
    console.error('Помилка відправки сповіщення адміну:', err);
  });
}

// Розпізнати чи є в повідомленні посилання на оплату
function containsPaymentLink(message) {
  return message.includes('wayforpay.com/button/');
}

// ============================================
// ОБРОБНИКИ КОМАНД
// ============================================

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'друже';
  
  const welcomeMessage = `
Привіт, ${firstName}! 👋

Я - AI-помічник Олександра Зєрщикова, професійного інструктора з водіння.

📚 Допоможу тобі:
• Обрати курс для навчання водінню
• Розповісти про кожен продукт детально
• Оформити замовлення та оплату

🎯 У нас є:
• Курс "ПДР за 220 хвилин" (від 880 грн)
• Курс "10 кроків до практичного водіння" (від 580 грн)
• Курс "Алгоритм проїзду перехресть" (480 грн)
• Розумний зошит з практики (360 грн)
• Робочий зошит з теорії ПДР (370 грн)

Що тебе цікавить? Просто напиши своє питання! 💬
  `.trim();
  
  bot.sendMessage(chatId, welcomeMessage);
  
  // Очищаємо історію при старті
  conversations.delete(chatId);
});

// Команда /menu - показати каталог
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  
  const menuMessage = `
📚 КАТАЛОГ ПРОДУКТІВ

🎓 ОНЛАЙН КУРСИ:

1️⃣ ПДР за 220 хвилин
   💰 Від 880 грн | ⏱ Швидке та структуроване вивчення
   📊 1200+ учнів | ⭐️ 4.9/5

2️⃣ 10 кроків до практичного водіння
   💰 Від 580 грн | 🚗 Від рушання до паркування
   👥 Для початківців та після перерви

3️⃣ Алгоритм проїзду перехресть
   💰 480 грн | 🚦 Чіткий алгоритм на перехресті
   🎥 6 детальних відеолекцій

📓 ДРУКОВАНІ ЗОШИТИ:

4️⃣ Розумний зошит - 360 грн
   📄 120 кольорових сторінок з завданнями
   📦 Доставка Новою Поштою за 3 дні

5️⃣ Робочий зошит з теорії ПДР - 370 грн
   📝 Структуровані завдання для вивчення
   🎯 Підготовка до іспиту в МВС

Напиши номер продукту або просто опиши, що тебе цікавить! 🎯
  `.trim();
  
  bot.sendMessage(chatId, menuMessage);
});

// Команда /contact - контакти
bot.onText(/\/contact/, (msg) => {
  const chatId = msg.chat.id;
  
  const contactMessage = `
📞 КОНТАКТИ

👨‍🏫 Олександр Зєрщиков
Професійний інструктор з водіння

📱 Телефон: 067-392-06-82
💬 Telegram: @zerschikov

🌐 Сайт: zerschikov.online
📺 YouTube: https://www.youtube.com/@instructor_zerschikov

Якщо у тебе складне питання або потрібна персональна консультація - пиши напряму Олександру!
  `.trim();
  
  bot.sendMessage(chatId, contactMessage);
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
❓ ЯК КОРИСТУВАТИСЯ БОТОМ

Просто пиши мені як звичайному помічнику! 💬

Приклади питань:
• "Хочу вивчити ПДР з нуля"
• "Яка різниця між тарифами Pro та Преміум?"
• "Мені потрібен курс для практичного водіння"
• "Скільки коштує Розумний зошит?"
• "Як швидко відправляєте зошити?"

📌 Команди:
/start - Почати спочатку
/menu - Каталог всіх продуктів
/contact - Контакти Олександра
/help - Ця довідка

Я розумію природні запитання та допоможу обрати найкращий варіант для тебе! 🎯
  `.trim();
  
  bot.sendMessage(chatId, helpMessage);
});

// ============================================
// ОБРОБКА ЗВИЧАЙНИХ ПОВІДОМЛЕНЬ
// ============================================

bot.on('message', async (msg) => {
  // Ігноруємо команди (вони оброблені вище)
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  
  if (!userMessage) return;
  
  // Показуємо індикатор "друкує..."
  bot.sendChatAction(chatId, 'typing');
  
  try {
    // Отримуємо відповідь від AI
    const aiResponse = await getAIResponse(chatId, userMessage);
    
    // Надсилаємо відповідь
    await bot.sendMessage(chatId, aiResponse, {
      disable_web_page_preview: false
    });
    
    // Якщо відповідь містить посилання на оплату - сповіщаємо адміна
    if (containsPaymentLink(aiResponse)) {
      const username = msg.from.username 
        ? `@${msg.from.username}` 
        : `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
      
      notifyAdmin({
        chatId,
        username,
        userMessage,
        botResponse: aiResponse
      });
    }
    
  } catch (error) {
    console.error('Bot Error:', error);
    
    let errorMessage = 'Вибачте, сталася помилка. Спробуйте ще раз або напишіть @zerschikov';
    
    if (error.response && error.response.body) {
      console.error('Telegram API Error:', error.response.body);
    }
    
    bot.sendMessage(chatId, errorMessage);
  }
});

// ============================================
// ЗАПУСК БОТА
// ============================================

console.log('╔══════════════════════════════════════╗');
console.log('║  🤖 TELEGRAM БОТ ЗАПУЩЕНО!         ║');
console.log('║                                      ║');
console.log('║  👨‍🏫 Олександр Зєрщиков            ║');
console.log('║  📚 Продаж онлайн-курсів           ║');
console.log('║                                      ║');
console.log('║  ✅ AI: Підключено                  ║');
console.log('║  ✅ Telegram: Активний              ║');
console.log('║  👋 Очікую на повідомлення...      ║');
console.log('╚══════════════════════════════════════╝');

// Обробка помилок
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.code, error.message);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
});
