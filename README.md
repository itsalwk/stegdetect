# Stegdetect

**Stegdetect** is a web and mobile application for **steganography** (hiding information inside images) and **steganalysis** (detecting hidden information).  
Built with **React** for the frontend and a **Django, Supabase (Postgres)** for the backend, it offers a clean, fast, and portable solution for image-based security research and experimentation.

---

## 🚀 Features
- 🔒 **Steganography**: Hide text/image/audio inside textimage/audio 
- 🔍 **Steganalysis**: Detect hidden information in uploaded image/text/audio
- 📱 Cross-platform frontend powered by **React**  
- ⚡ **Supabase, Django ** for backend  
- 📂 Supports common formats (PNG, JPG, WAV, md etc.)  

---

## 🛠️ Tech Stack
- **Frontend** → React Native  
- **Backend** → Django (Serverless)  
- **Deployment** → AWS Lambda / Vercel / Netlify Functions  
- **Storage** → Local/Cloud (S3, Firebase, or similar)  

---

## 📦 Installation

### 1. Clone the repository
```bash
git clone https://github.com/itsalwk/stegdetect.git
cd stegdetect
````

### 2. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

Run on:

```bash
# 
npm run dev
```

### 3. Backend Setup (Django Serverless)

```bash
cd backend
pip install -r requirements.txt
```

Run locally:

```bash
python manage.py runserver
```

Deploy to serverless (example: AWS Lambda with Zappa):

```bash
zappa deploy dev
```

---

## ▶️ Usage

1. Open the app on your device
2. Upload or select an image
3. Choose:

   * **Encode** → Hide a message in the image
   * **Decode/Analyze** → Detect hidden data in an image
4. View or download the processed image/report

---

## 📸 Screenshots

*Add screenshots or demo GIFs here.*

---

## 🤝 Contributing

Contributions are welcome!

1. Fork this repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a Pull Request

