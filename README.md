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
  <img src="https://img.shields.io/badge/Stack-React%20|%20Flask%20|%20Supabase-success.svg?style=for-the-badge" alt="Stack">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
</p>

---

**Stegdetect** is an open-source security toolkit for steganography (hiding secret messages) and steganalysis (finding them). 

It allows you to tuck away secret payloads into digital files or run statistical checks to uncover hidden information in existing media. The frontend provides a sleek UI, while the backend handles the heavy lifting. If you want a fast, reliable, and cloud-synced environment for image and audio-based security research, this is it.

**[Website](#) · [Docs](#) · [Vision](#) · [Getting Started](#quick-start) · [Showcase](#) · [Docker](#)**

## ✨ Highlights

* **Local-first Processing** — Single control plane for uploading, encoding, and analyzing payloads.
* **Secure Hiding Spots** — Easily hide text, images, or audio files right inside other media via LSB (Least Significant Bit) encoding.
* **Deep Detective Work** — Run quick statistical checks on files to detect potential hidden steganographic data.
* **Cloud Persistence** — Thanks to Supabase, all uploads and history are safely stored and synced in your cloud database and storage buckets.
* **Modern UI** — Fully responsive frontend interface built with React, Vite, and Tailwind CSS.

### Supported Media
* **Images:** PNG, JPG
* **Audio:** WAV
* **Text:** Markdown (MD)

---

## 🚀 Quick Start

**Prerequisites:** Node ≥18 and Python ≥3.9. Works with npm, pnpm, or bun.

```bash
# 1. Clone the repository
git clone [https://github.com/itsalwk/stegdetect.git](https://github.com/itsalwk/stegdetect.git)
cd stegdetect

# 2. Setup Frontend
cd frontend
npm install
npm run dev

# 3. Setup Backend
cd ../backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

```

---

## 🏗️ Architecture

```text
Browser / Web Client
               │
               ▼
┌───────────────────────────────┐
│     React + Vite Frontend     │
│       (Tailwind CSS UI)       │
│      http://localhost:5173    │
└──────────────┬────────────────┘
               │ REST API
               ▼
┌───────────────────────────────┐
│         Flask Backend         │
│     (Core Logic & Analysis)   │
│      http://localhost:5000    │
└──────────────┬────────────────┘
               │ Supabase SDK
               ▼
┌───────────────────────────────┐
│            Supabase           │
│   (Postgres, Auth, Storage)   │
└───────────────────────────────┘

```

### Key Subsystems

* **Vite Frontend:** Handles user interactions, file selection, and payload input. Built for speed.
* **Flask API:** The analytical engine. Processes the LSB algorithms and statistical steganalysis.
* **Supabase Cloud:** Manages row-level security (RLS), user sessions, and persistent blob storage for carrier files.

---

## ⚙️ Configuration

### Supabase Database Setup

Stegdetect requires a configured Supabase instance to handle the database, logins, and file storage.

1. **Database Setup:** Head over to your Supabase SQL editor and run this snippet to create your uploads table:

```sql
CREATE TABLE uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  media_type text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Allow users to access their own data
CREATE POLICY "Authenticated Access" ON uploads FOR ALL USING (auth.uid() = user_id);

```

2. **Auth & Storage:** Enable Email/Password logins in your Supabase Auth settings. Create a new public storage bucket named `media`.

### Environment Variables

You must configure your `.env` variables for both the frontend and backend to communicate with Supabase.

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

Stegdetect connects to real databases and handles file uploads. Always treat inbound file uploads as untrusted input.

* **File Validation:** The Flask backend strictly checks magic numbers and mime types to ensure uploaded files match their extensions.
* **Row Level Security:** The Supabase integration enforces strict RLS policies so users can only access their own processed media.
* **Storage Limits:** Implement file size limits on your Supabase media bucket to prevent abuse.

---

## 🗺️ Roadmap

* [ ] **Extra Security:** Adding AES-256 encryption so your payloads are locked down before they're even hidden.
* [ ] **More File Types:** Adding support for MP4 videos and PDF documents.
* [ ] **Going Mobile:** Bringing the app to iOS and Android using React Native.
* [ ] **API Access:** Building out public endpoints so you can run remote steganography scans programmatically.

---

## 🤝 Community & Contributing

See `CONTRIBUTING.md` for guidelines, maintainers, and how to submit PRs. Security and Cryptography PRs are highly welcome! 🕵️

Special thanks to all contributors who have helped shape Stegdetect.

[![GitHub Profile](https://img.shields.io/badge/Developer-itsalwk-black?style=for-the-badge&logo=github)](https://github.com/itsalwk)