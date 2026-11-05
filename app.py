from flask import Flask, render_template, request, jsonify, session
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "birthday-tribute-secret-05112008")

# ============================
# GANTI SESUAI KEINGINAN KAMU
# ============================
SECRET_PASSWORD = "05112008"        # Password brankas
BIRTHDAY_GIRL_NAME = "Inezia Novia Anakampun"       # Nama cewe kamu
YOUR_NAME = "- yoyiccc"                  # Nama kamu
BIRTHDAY_MESSAGE = "Thank you for everything — you mean the world to me. I love you, always and forever. 💕"

# Photo list — place photos in the static/images/ folder
# Format: {"src": "filename.jpg", "caption": "Photo title", "message": "Special words for this photo"}
PHOTOS = [
    {
        "src": "photo1.jpg",
        "caption": "Your Most Beautiful Smile",
        "message": "Your smile is the first thing I look for every morning. Nothing is more beautiful than seeing you happy. 💕"
    },
    {
        "src": "photo2.jpg",
        "caption": "A Precious Moment",
        "message": "Every second with you feels like a miracle. I have never regretted a single moment we've shared together. 🌸"
    },
    {
        "src": "photo3.jpg",
        "caption": "You're My Happiness",
        "message": "This photo always reminds me how lucky I am to know you. You are the best memory of my life. ✨"
    },
    {
        "src": "photo4.jpg",
        "caption": "The World Is Colorful With You",
        "message": "Before you, my life felt grey. You are the one who brought color, laughter, and warmth into every single day. 🌈"
    },
    {
        "src": "photo5.jpg",
        "caption": "Thank You For Everything",
        "message": "Thank you for choosing to be here, in my life. You are the answer to a prayer I never even said out loud. 💖"
    },
    {
        "src": "photo6.jpg",
        "caption": "So Adorable",
        "message": "The way you act and carry yourself always makes me smile on my own. Never stop being exactly who you are. 🥰"
    },
    {
        "src": "photo7.jpg",
        "caption": "Our Funny Moment",
        "message": "Every silly moment together with you is a sweet story I will never, ever forget. 🛍️✨"
    },
    {
        "src": "photo8.jpg",
        "caption": "My Favorite Look",
        "message": "I never get tired of looking at your beautiful face. There is always peace and happiness in your eyes. 💫"
    },
    {
        "src": "photo9.jpg",
        "caption": "Unmatched Beauty",
        "message": "From any angle, you are always the most beautiful in my eyes. Every second I fall more in love. 🌷"
    },
    {
        "src": "photo10.jpg",
        "caption": "I Love You Always",
        "message": "This love is real and true for you — today, tomorrow, and forever. Happy Birthday, my love! 💖"
    },
]
# ============================

@app.route("/")
def index():
    return render_template("index.html",
        name=BIRTHDAY_GIRL_NAME,
        your_name=YOUR_NAME,
        message=BIRTHDAY_MESSAGE,
        photos=PHOTOS
    )

@app.route("/unlock", methods=["POST"])
def unlock():
    data = request.get_json()
    password = data.get("password", "")
    if password == SECRET_PASSWORD:
        session["unlocked"] = True
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Wrong password, try again 💔"})

@app.route("/check")
def check():
    return jsonify({"unlocked": session.get("unlocked", False)})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=True, port=port)











