# Создание Telegram бота для Web App

## 🤖 Создание бота

### 1. Создайте бота через BotFather

1. Откройте Telegram и найдите [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newbot`
3. Введите имя бота: `Калькулятор Юнит-Экономики`
4. Введите username бота: `MaksimovWB_CalculatorBot` (или любой уникальный)
5. Сохраните полученный **TOKEN** бота

### 2. Настройте Web App

1. Отправьте BotFather команду `/newapp`
2. Выберите вашего бота
3. Введите название приложения: `Калькулятор Юнит-Экономики`
4. Введите описание: `Расчет прибыльности товаров на Wildberries`
5. Загрузите иконку приложения (512x512px)
6. Введите URL приложения: `https://ваш-домен.com/index.html`

### 3. Настройте меню бота

Отправьте BotFather команду:
```
/setmenubutton
```

Выберите бота и отправьте:
```
Калькулятор Юнит-Экономики
https://ваш-домен.com/index.html
```

## 🌐 Развертывание Web App

### Вариант 1: GitHub Pages (бесплатно)

1. Создайте репозиторий на GitHub
2. Загрузите файлы проекта
3. Включите GitHub Pages в настройках репозитория
4. URL будет: `https://ваш-username.github.io/WebUnit-economik`

### Вариант 2: Netlify (бесплатно)

1. Зайдите на [netlify.com](https://netlify.com)
2. Перетащите папку с проектом
3. Получите URL: `https://случайное-имя.netlify.app`

### Вариант 3: Vercel (бесплатно)

1. Зайдите на [vercel.com](https://vercel.com)
2. Импортируйте проект из GitHub
3. Получите URL: `https://ваш-проект.vercel.app`

## 🔧 Настройка бота (опционально)

### Создайте простого бота на Python

```python
import telebot
from telebot.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

# Замените на ваш токен
TOKEN = 'YOUR_BOT_TOKEN'

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "🧮 Открыть калькулятор",
        web_app=WebAppInfo(url="https://ваш-домен.com/index.html")
    ))
    
    bot.send_message(
        message.chat.id,
        "👋 Добро пожаловать в калькулятор юнит-экономики!\n\n"
        "Этот инструмент поможет вам рассчитать прибыльность товаров на Wildberries.\n\n"
        "📊 Что вы можете рассчитать:\n"
        "• Маржинальность и рентабельность\n"
        "• Прибыль при разных налоговых ставках\n"
        "• Все расходы WB (логистика, комиссии, хранение)\n\n"
        "Нажмите кнопку ниже, чтобы начать расчеты!",
        reply_markup=markup
    )

@bot.message_handler(func=lambda message: True)
def handle_web_app_data(message):
    if message.web_app_data:
        try:
            data = json.loads(message.web_app_data.data)
            if data.get('type') == 'unit_economics_results':
                # Обработка результатов
                results = data.get('data', {})
                message_text = data.get('message', 'Результаты расчета')
                
                bot.send_message(
                    message.chat.id,
                    message_text,
                    parse_mode='Markdown'
                )
        except Exception as e:
            bot.send_message(message.chat.id, "Ошибка обработки данных")

if __name__ == '__main__':
    bot.polling(none_stop=True)
```

## 📱 Тестирование

### 1. Локальное тестирование

1. Откройте `index.html` в браузере
2. Проверьте все функции калькулятора
3. Убедитесь, что все расчеты корректны

### 2. Тестирование в Telegram

1. Найдите вашего бота в Telegram
2. Нажмите `/start`
3. Нажмите кнопку "Открыть калькулятор"
4. Проверьте работу Web App
5. Протестируйте кнопку "Поделиться результатами"

## 🚀 Продвижение

### 1. Создайте канал

1. Создайте канал `@MaksimovWB`
2. Добавьте бота как администратора
3. Создайте пост с описанием калькулятора

### 2. Добавьте в описание бота

```
🧮 Калькулятор юнит-экономики для Wildberries

📊 Рассчитывайте:
• Маржинальность и рентабельность
• Прибыль при разных налоговых ставках
• Все расходы WB

🤖 Создано @MaksimovWB
```

### 3. Создайте команды бота

```
/setcommands
```

```
start - Запустить калькулятор
help - Помощь по использованию
about - О боте и авторе
```

## 🔒 Безопасность

1. **Никогда не публикуйте токен бота**
2. **Используйте HTTPS для Web App**
3. **Валидируйте данные от пользователей**
4. **Ограничьте размер загружаемых данных**

## 📈 Мониторинг

1. Используйте [@BotFather](https://t.me/BotFather) для статистики
2. Добавьте логирование в бота
3. Отслеживайте ошибки пользователей

## 🎯 Готово!

После выполнения всех шагов у вас будет:

✅ Telegram бот с Web App  
✅ Полнофункциональный калькулятор  
✅ Возможность делиться результатами  
✅ Профессиональный интерфейс  

**Связь:** [@MaksimovWB](https://t.me/MaksimovWB)
