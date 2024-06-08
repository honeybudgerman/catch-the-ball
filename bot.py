from telegram import Bot, Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, CallbackContext

TOKEN = 'YOUR_BOT_TOKEN'
GAME_SHORT_NAME = 'catchtheball'

def start(update: Update, context: CallbackContext):
    keyboard = [[InlineKeyboardButton("Play Catch the Ball", callback_data=GAME_SHORT_NAME)]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    update.message.reply_text('Press the button below to play the game!', reply_markup=reply_markup)

def game_callback(update: Update, context: CallbackContext):
    query = update.callback_query
    if query.data == GAME_SHORT_NAME:
        bot = Bot(TOKEN)
        bot.send_game(chat_id=query.message.chat_id, game_short_name=GAME_SHORT_NAME)

def main():
    updater = Updater(TOKEN, use_context=True)
    dp = updater.dispatcher

    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(CallbackQueryHandler(game_callback))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
