#!/usr/bin/env python3
"""
Telegram бот для калькулятора юнит-экономики
Автор: @MaksimovWB
"""

import telebot
import json
import os
from telebot.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

# Конфигурация
TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://ваш-домен.com/index.html')

# Создаем бота
bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def start_command(message):
    """Обработчик команды /start"""
    markup = InlineKeyboardMarkup()
    markup.add(InlineKeyboardButton(
        "🧮 Открыть калькулятор",
        web_app=WebAppInfo(url=WEB_APP_URL)
    ))
    
    welcome_text = """
👋 *Добро пожаловать в калькулятор юнит-экономики!*

Этот инструмент поможет вам рассчитать прибыльность товаров на Wildberries.

📊 *Что вы можете рассчитать:*
• Маржинальность и рентабельность
• Прибыль при разных налоговых ставках (2%, 5%, 7%)
• Все расходы WB (логистика, комиссии, хранение)
• Эквайринг и налогообложение

🎯 *Как использовать:*
1. Нажмите кнопку "Открыть калькулятор"
2. Заполните данные о товаре
3. Получите детальный расчет
4. Поделитесь результатами

🤖 *Создано @MaksimovWB* - эксперт по маркетплейсам

Нажмите кнопку ниже, чтобы начать расчеты!
    """
    
    bot.send_message(
        message.chat.id,
        welcome_text,
        reply_markup=markup,
        parse_mode='Markdown'
    )

@bot.message_handler(commands=['help'])
def help_command(message):
    """Обработчик команды /help"""
    help_text = """
🆘 *Помощь по использованию калькулятора*

📋 *Параметры для расчета:*
• **Продано единиц** - количество проданного товара
• **Логистика ВБ** - стоимость доставки (руб.)
• **Фулфилмент** - стоимость обработки заказа (руб.)
• **Комиссия ВБ** - процент комиссии маркетплейса (%)
• **Стоимость хранения ВБ** - плата за хранение (руб.)
• **Реклама** - расходы на продвижение (руб.)
• **Закупочная цена товара** - себестоимость (руб.)
• **Цена продажи** - розничная цена на WB (руб.)
• **Процент выкупа** - доля выкупленных товаров (%)

📈 *Результаты расчета:*
• Маржинальность - отношение прибыли к выручке
• Рентабельность - отношение прибыли к себестоимости
• Прибыль при разных налоговых ставках

💡 *Советы:*
• Используйте реальные данные для точных расчетов
• Учитывайте сезонность при расчете процента выкупа
• Регулярно пересчитывайте при изменении комиссий WB

🤖 *Поддержка:* @MaksimovWB
    """
    
    bot.send_message(
        message.chat.id,
        help_text,
        parse_mode='Markdown'
    )

@bot.message_handler(commands=['about'])
def about_command(message):
    """Обработчик команды /about"""
    about_text = """
ℹ️ *О калькуляторе юнит-экономики*

🎯 *Назначение:*
Этот калькулятор создан для точного расчета прибыльности товаров на маркетплейсе Wildberries с учетом всех расходов и налогов.

👨‍💻 *Автор:*
[@MaksimovWB](https://t.me/MaksimovWB) - эксперт по работе с маркетплейсами

🔧 *Технологии:*
• HTML5, CSS3, JavaScript
• Telegram Web Apps API
• Адаптивный дизайн

📊 *Особенности:*
• Расчет для разных налоговых ставок
• Учет всех расходов WB
• Экспорт результатов
• Современный интерфейс

🚀 *Версия:* 1.0.0

📞 *Связь:* [@MaksimovWB](https://t.me/MaksimovWB)
    """
    
    bot.send_message(
        message.chat.id,
        about_text,
        parse_mode='Markdown'
    )

@bot.message_handler(func=lambda message: True)
def handle_web_app_data(message):
    """Обработчик данных от Web App"""
    if message.web_app_data:
        try:
            data = json.loads(message.web_app_data.data)
            
            if data.get('type') == 'unit_economics_results':
                # Получаем результаты расчета
                results = data.get('data', {})
                message_text = data.get('message', 'Результаты расчета')
                
                # Отправляем результаты пользователю
                bot.send_message(
                    message.chat.id,
                    message_text,
                    parse_mode='Markdown'
                )
                
                # Логируем использование
                user_info = f"User: {message.from_user.username or message.from_user.first_name}"
                print(f"Calculation shared by {user_info}")
                
        except json.JSONDecodeError:
            bot.send_message(
                message.chat.id,
                "❌ Ошибка обработки данных. Попробуйте еще раз."
            )
        except Exception as e:
            print(f"Error handling web app data: {e}")
            bot.send_message(
                message.chat.id,
                "❌ Произошла ошибка. Обратитесь к @MaksimovWB"
            )
    else:
        # Обычные сообщения
        bot.send_message(
            message.chat.id,
            "🤖 Используйте команды:\n"
            "/start - Запустить калькулятор\n"
            "/help - Помощь\n"
            "/about - О боте"
        )

def main():
    """Основная функция"""
    print("🤖 Запуск бота калькулятора юнит-экономики...")
    print(f"🌐 Web App URL: {WEB_APP_URL}")
    
    try:
        bot.polling(none_stop=True)
    except Exception as e:
        print(f"❌ Ошибка запуска бота: {e}")

if __name__ == '__main__':
    main()
