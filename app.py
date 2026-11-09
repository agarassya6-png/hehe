from flask import Flask, render_template, request, jsonify, session
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "birthday-tribute-secret-030425")

# ============================
# GANTI SESUAI KEINGINAN KAMU
# ============================
SECRET_PASSWORD = "030425"        # Password brankas
GIRL_NAME = "Laura Adelsia"       # Nama cewe kamu
YOUR_NAME = "- hapiss"                  # Nama kamu
GIFT_MESSAGE = "Hadiah kecil ini aku buat khusus untuk Laura tercinta. Terima kasih sudah hadir dalam hidupku, membawa senyum, tawa, dan kebahagiaan di setiap hari-hariku. Kamu adalah hal terbaik dan terindah yang pernah kumiliki. I love you, always and forever. 💕✨"

# Photo list — place photos in the static/images/ folder
# Format: {"src": "filename.jpg", "caption": "Photo title", "message": "Special words for this photo"}
PHOTOS = [
    {
        "src": "photo1.jpg",
        "caption": "Your Radiant Smile",
        "message": "Senyum manis kamu yang selalu bikin kagum. Wanita hebat, anggun, dan selalu membanggakan dalam setiap hal yang kamu lakukan. 💕✨"
    },
    {
        "src": "photo2.jpg",
        "caption": "Leaning on You",
        "message": "Bersandar di pundakmu selalu jadi momen ternyaman. Terima kasih sudah selalu jadi tempat pulang terhangat buat aku. 🥰🤍"
    },
    {
        "src": "photo3.jpg",
        "caption": "Our Silly & Cute Moments",
        "message": "Tingkah konyol dan serunya kita berdua. Nggak pernah ada kata bosan kalau lagi ketawa bareng kamu! 😜💖"
    },
    {
        "src": "photo4.jpg",
        "caption": "Cutest Expressions",
        "message": "Tiap ekspresi lucu dan kedipan manis kamu selalu sukses bikin hari-hariku jauh lebih ceria dan berwarna. 🌸✨"
    },
    {
        "src": "photo5.jpg",
        "caption": "Starlight in the Night",
        "message": "Bahkan di tengah gelapnya malam, senyuman dan ketulusanmu selalu jadi cahaya paling terang buat aku. 🌙💙"
    },
    {
        "src": "photo6.jpg",
        "caption": "Our Mall Date",
        "message": "Jalan-jalan santai, mirror selfie, dan ketawa bareng kamu di mall. Sederhana tapi selalu jadi memori favoritku. 🛍️🖤"
    },
    {
        "src": "photo7.jpg",
        "caption": "Cinema Date Memories",
        "message": "Nonton bareng dan gandengan tangan sama kamu di bioskop. Bersamamu, tempat biasa selalu terasa begitu istimewa dan hangat. 🎬🍿"
    },
    {
        "src": "photo8.jpg",
        "caption": "My Safest Comfort",
        "message": "Di dekat kamu adalah tempat ternyaman dan terindah di dunia. Terima kasih sudah selalu ada. I love you always and forever! 💖✨"
    },
]
# ============================

@app.route("/")
def index():
    return render_template("index.html",
        name=GIRL_NAME,
        your_name=YOUR_NAME,
        message=GIFT_MESSAGE,
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
    app.run(debug=True, host="0.0.0.0", port=port)











