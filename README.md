## 🛡️ StegDETECT —  Steganalysis & Steganography Tool

<p align="center">
  <picture>
    <img alt="Stegdetect Logo" src="stegdetect-logo.png" width="500">
  </picture>
</p>

<p align="center"><strong>HIDE! SEEK!</strong></p>

<p align="center">
  <a href="https://github.com/itsalwk/stegdetect/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/itsalwk/stegdetect/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://github.com/itsalwk/stegdetect/releases"><img src="https://img.shields.io/github/v/release/itsalwk/stegdetect?include_prereleases&style=for-the-badge" alt="GitHub release"></a>
  <img src="https://img.shields.io/badge/Stack-React%20|%20FastAPI%20|%20Supabase-success.svg?style=for-the-badge" alt="Stack">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

---

**Stegdetect** is an open-source security toolkit for steganography (hiding secret messages) and steganalysis (finding them). 

It allows you to tuck away secret payloads into digital files or run statistical checks to uncover hidden information in existing media. The frontend provides a sleek UI, while the backend handles the heavy lifting using modern asynchronous Python.

**[Website](#) · [Docs](#) · [Vision](#) · [Getting Started](#quick-start) · [Showcase](#) · [Docker](#)**

## ✨ Highlights

* **Full-Stack Architecture** — Seamless integration between a React/Vite frontend and a FastAPI backend.
* **Local-first Processing** — Single control plane for uploading, encoding, and analyzing payloads.
* **Secure Hiding Spots** — Easily hide text, images, or audio files right inside other media via LSB (Least Significant Bit) encoding.
* **Deep Detective Work** — Run quick statistical checks on files to detect potential hidden steganographic data.
* **Cloud Persistence** — Powered by Supabase for secure database storage and bucket-based asset management.
* **Type-Safe Development** — Built with TypeScript and Python Type Hints (Pydantic) for maximum reliability.

### Supported Media
* **Images:** PNG
* **Audio:** WAV
 
---

## 🔍 Methodology (How It Works)

* **Input:** Upload an image (PNG) or audio (WAV) file as cover media, along with your secret message.
* **Preprocessing:** Compress the secret payload to save space and normalize the cover media. If a password is provided, securely encrypt the payload.
* **Steganography:**
  * **Image:** Hide data quietly within the Least Significant Bits (LSB) of the image pixels.
  * **Audio:** Hide data within the Least Significant Bits (LSB) of the audio samples.
* **Steganalysis:**
  * Extract the payload using length signatures and error checking.
  * Test images using statistical checks (Chi-Square & RS Analysis) to detect if someone has hidden secrets inside.
* **Output:** Receive the modified stego-media or the safely recovered secret message.

---

## � Key Results & Findings

* **Capacity vs. Quality:** Embedding data across 1-2 bits per byte preserves visual/auditory quality, but higher bit-depths (3-4 bits) noticeably introduce noise and static.
* **Effective Steganalysis:** The combination of Chi-Square and RS Analysis successfully identifies anomalous color variances and pixel distribution shifts in images altered by LSB steganography.
* **Compression Efficiency:** Preprocessing the text payloads using `Zlib` significantly reduces the overall footprint, increasing the amount of text that can be safely hidden within the same carrier file.
* **Robust Security:** AES-GCM encryption provides strong guarantees. Without the correct password, extracting the payload results in completely unreadable byte streams.
* **Format Sensitivity:** Image steganography is currently bound strictly to lossless formats like PNG. Converting stego-images to lossy formats (like JPG) destroys the precise bit manipulation required to recover the hidden data.

---

## �🚀 Quick Start

**Prerequisites:** Node v20 and Python v3.1. Works with npm, pnpm, or bun.

```bash
# 1. Clone the repository
git clone https://github.com/itsalwk/stegdetect.git
cd stegdetect

# 2. Setup Frontend
cd frontend
npm install
npm run dev

# 3. Setup Backend
cd ../backend
# Use a virtual environment
conda create -n stegdetect python=3.11
conda activate stegdetect
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🏗️ Architecture

```text
Browser / Web Client
               │
               ▼
┌───────────────────────────────┐
│     React + Vite Frontend     │
│  (Shadcn/UI + Tailwind CSS)   │
│      http://localhost:8080    │
└──────────────┬────────────────┘
               │ REST API (JSON)
               ▼
┌───────────────────────────────┐
│       FastAPI Backend         │
│  (Pillow + NumPy + Pydantic)  │
│      http://localhost:8000    │
└──────────────┬────────────────┘
               │ Supabase SDK
               ▼
┌───────────────────────────────┐
│            Supabase           │
│   (Postgres, Auth, Storage)   │
└───────────────────────────────┘
```

### Key Subsystems

* **Vite Frontend:** Handles user interactions and cryptographic operations (AES-GCM via Web Crypto API).
* **FastAPI Backend:** The high-performance engine for image processing and complex steganalysis algorithms.
* **Supabase Cloud:** Manages row-level security (RLS), user sessions, and persistent blob storage for carrier files.

---

## ⚙️ Configuration & Skills

### Engineering Guides (Skills)
We have prepared specialized engineering guides for different parts of the stack:
- 🎨 [Frontend Developer Guide](skills/frontend-developer-skill.md)
- ⚙️ [Backend Developer Guide](skills/backend-developer-skill.md)
- 🛠️ [Full-Stack Developer Guide](skills/full-stack-developer-skill.md)
- ☁️ [Supabase Cloud Setup Guide](skills/supabase-setup-guide.md)

### Environment Variables

**Backend (`backend/.env`)**
```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_service_role_key
```

**Frontend (`frontend/.env.local`)**
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🔒 Security Defaults

* **Encrypted Payloads:** StegDETECT uses AES-GCM for encrypting messages before embedding them into carrier files.
* **Input Sanitization:** The FastAPI backend strictly validates file headers and mime types using Pillow.
* **Row Level Security:** Supabase enforces strict RLS policies, ensuring users only access their own data.

---

## 🗺️ Roadmap

* [x] **FastAPI Migration:** Complete transition from Flask to FastAPI for better performance.
* [ ] **Video Support:** Adding support for MP4 and AVI files.
* [ ] **Advanced Steganalysis:** Implementing RS (Regular-Singular) and Chi-square analysis.
* [ ] **Mobile App:** Cross-platform mobile version using React Native.

---

## 🤝 Community & Contributing

See `CONTRIBUTING.md` for guidelines. Security and Cryptography PRs are highly welcome! 🕵️

[![GitHub Profile](https://img.shields.io/badge/Developer-itsalwk-black?style=for-the-badge&logo=github)](https://github.com/itsalwk)