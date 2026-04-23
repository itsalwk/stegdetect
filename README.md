## 🛡️ StegDETECT — Steganalysis & Steganography Web App

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

**Stegdetect** is a complete, full-stack open-source security toolkit for steganography (hiding secret messages) and steganalysis (finding them).

It provides a single, unified web interface to tuck away secret payloads into digital files or run statistical checks to uncover hidden information in existing media. The modern web frontend delivers a sleek and responsive UI, while the robust backend handles heavy lifting utilizing asynchronous Python.

**[Project Report](docs/report.pdf) · [Presentation](docs/presentation.pdf) · [Getting Started](#quick-start) · [Screenshots](#screenshots)**

## ✨ Highlights

* **Full-Stack Architecture** — Seamless integration between a React/Vite frontend and a FastAPI backend.
* **Modern Web Interface** — A complete web application offering a responsive and intuitive user experience.
* **Local-first Processing** — Single control plane for uploading, encoding, and analyzing payloads.
* **Secure Hiding Spots** — Easily hide text, images, or audio files right inside other media via LSB (Least Significant Bit) encoding.
* **Deep Detective Work** — Run quick statistical checks on files to detect potential hidden steganographic data.
* **Cloud Persistence** — Powered by Supabase for secure database storage and bucket-based asset management.
* **Type-Safe Development** — Built with TypeScript and Python Type Hints (Pydantic) for maximum reliability.

### Supported Media

* **Images:** PNG
* **Audio:** WAV

---

## 📸 Screenshots

Here is a glimpse of the StegDETECT web application in action:

<details>
<summary><strong>Landing Page</strong></summary>
<br>
<img src="docs/screen%20shots/landing-page.png" alt="Landing Page" width="800">
</details>

<details>
<summary><strong>Sign In & Sign Up</strong></summary>
<br>
<img src="docs/screen%20shots/sign-in-page.png" alt="Sign In Page" width="400">
<img src="docs/screen%20shots/sign-up-page.png" alt="Sign Up Page" width="400">
</details>

<details>
<summary><strong>Steganography (Hiding Data)</strong></summary>
<br>
<img src="docs/screen%20shots/steganography-page.png" alt="Steganography Page" width="800">
</details>

<details>
<summary><strong>Steganalysis (Detecting Data)</strong></summary>
<br>
<img src="docs/screen%20shots/steganalysis-page.png" alt="Steganalysis Page" width="800">
</details>

<details>
<summary><strong>History & Settings</strong></summary>
<br>
<img src="docs/screen%20shots/history-page.jpg" alt="History Page" width="400">
<img src="docs/screen%20shots/settings-page.png" alt="Settings Page" width="400">
</details>

---

## 📄 Project Documents

Learn more about the research, methodology, and theoretical background of StegDETECT:

* **[Comprehensive Project Report](docs/report.pdf)** - Deep dive into the implementation and results.
* **[Project Presentation](docs/presentation.pdf)** - Overview slides summarizing the project.

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

## 🚀 Quick Start

**Prerequisites:** Node v20 and Python v3.11. Works with npm, pnpm, or bun.

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

## 🤝 Community & Contributing

See `CONTRIBUTING.md` for guidelines. Security and Cryptography PRs are highly welcome! 🕵️

[![GitHub Profile](https://img.shields.io/badge/Developer-itsalwk-black?style=for-the-badge&logo=github)](https://github.com/itsalwk)
