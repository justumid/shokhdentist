import asyncio
import aiohttp
from telegram import Update, ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://your-web-app.com")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

async def register_user(phone: str, full_name: str, chat_id: int, username: str = None):
    """Register user in backend"""
    try:
        async with aiohttp.ClientSession() as session:
            user_data = {
                "phone": phone,
                "fullName": full_name,
                "chatId": chat_id,
                "username": username,
                "registeredAt": asyncio.get_event_loop().time()
            }
            # You can add user registration endpoint to backend if needed
            print(f"User registered: {user_data}")
            return True
    except Exception as e:
        print(f"Registration error: {e}")
        return False

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[KeyboardButton("Ro'yxatdan o'tish", request_contact=True)]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True, one_time_keyboard=True)
    
    await update.message.reply_text(
        "🦷 Assalomu alaykum! ShokhDentist botiga xush kelibsiz.\n\n"
        "Ro'yxatdan o'tish uchun telefon raqamingizni ulashing.",
        reply_markup=reply_markup
    )

async def handle_contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    contact = update.message.contact
    user = update.effective_user
    
    # Telegram'dan olingan ma'lumotlar
    phone = contact.phone_number
    full_name = user.full_name or "Noma'lum"
    chat_id = user.id
    username = user.username
    
    # Profile rasmini olish
    try:
        photos = await context.bot.get_user_profile_photos(user.id, limit=1)
        has_photo = len(photos.photos) > 0
    except:
        has_photo = False
    
    # Backend'ga ro'yxatdan o'tkazish
    registered = await register_user(phone, full_name, chat_id, username)
    
    if registered:
        # Tasdiqlash xabari va web-app tugmasi
        keyboard = [[InlineKeyboardButton("🦷 Qabulga yozilish", web_app=WebAppInfo(url=WEB_APP_URL))]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            f"✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!\n\n"
            f"👤 Ism: {full_name}\n"
            f"📱 Telefon: {phone}\n"
            f"📸 Profil rasmi: {'Mavjud' if has_photo else 'Yo\'q'}\n\n"
            f"Endi qabulga yozilishingiz mumkin:",
            reply_markup=reply_markup
        )
    else:
        await update.message.reply_text(
            "❌ Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
        )

def main():
    if not BOT_TOKEN:
        print("❌ BOT_TOKEN not found in .env file")
        return
    
    app = Application.builder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.CONTACT, handle_contact))
    
    print("🤖 Bot ishga tushdi...")
    print(f"🌐 Web App URL: {WEB_APP_URL}")
    print(f"🔗 API Base URL: {API_BASE_URL}")
    
    app.run_polling()

if __name__ == "__main__":
    main()
