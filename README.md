# 🎂 Birthday Web — Cara Pakai

## Setup

1. Install Python (3.8+) kalau belum ada

2. Install dependency:
```
pip install flask
```

3. Jalankan web:
```
python app.py
```

4. Buka browser: http://localhost:5000

---

## Kustomisasi (buka app.py, bagian atas)

```python
SECRET_PASSWORD = "sayangku"        # ← Ganti password brankas
BIRTHDAY_GIRL_NAME = "Sayang"       # ← Ganti nama cewe kamu
YOUR_NAME = "Kamu"                  # ← Ganti nama kamu
BIRTHDAY_MESSAGE = "..."            # ← Ganti pesan ulang tahun
```

---

## Menambahkan Foto

1. Taruh foto kamu di folder: `static/images/`
2. Di `app.py`, edit bagian PHOTOS:

```python
PHOTOS = [
    {"src": "foto1.jpg", "caption": "Caption foto pertama 💕"},
    {"src": "foto2.jpg", "caption": "Caption foto kedua 🌸"},
    # tambahkan sebanyak yang kamu mau!
]
```

Nama file harus sama persis dengan nama file foto yang kamu taruh.

---

## Fitur
- 🔐 Halaman brankas dengan animasi dial berputar
- 🌸 Hujan kelopak bunga setelah berhasil masuk
- 📸 Galeri foto dengan lightbox (klik foto untuk zoom)
- 💌 Pesan romantis dengan animasi scroll
- ✨ Efek bintang dan partikel
- 📱 Responsif di HP maupun komputer
