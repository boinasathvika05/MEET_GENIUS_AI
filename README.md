# AI Meeting Notes Automation Platform

A production-ready SaaS application that automatically processes meeting transcripts and generates executive summaries, action items, and follow-up emails using the Gemini AI API.

## Features
- **Smart Parsing**: Extract insights from raw text, `.md`, `.txt`, `.pdf`, and `.docx` files.
- **AI Processing Pipeline**: Multi-stage pipeline (Normalization, Extraction, Summarization, Action Items, Email Generation, Validation).
- **History & Favorites**: Save processed meetings to local storage using Zustand.
- **Export**: Export meeting notes to Markdown, JSON, or PDF.

## Architecture & Tech Stack
This project operates as a monorepo consisting of:
- **Frontend (Next.js 15, React, Tailwind CSS, shadcn/ui)**: A responsive, beautiful dashboard for managing meeting notes.
- **Backend (FastAPI, Python)**: A high-performance Python API that coordinates with the Google Gemini API to process and structure the text.

## Folder Structure
```
/
├── app/
│   ├── frontend/       # Next.js 15 App Router frontend
│   └── backend/        # FastAPI Python backend
├── .gitignore
└── README.md
```

## Installation & Running Locally

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Gemini API Key

### Backend Setup
1. Navigate to the backend directory: `cd app/backend`
2. Install dependencies: `pip install -r requirements.txt` (and `pip install PyPDF2 python-docx python-multipart`)
3. Copy `.env.example` to `.env` and insert your Gemini API Key.
4. Run the server: `uvicorn main:app --reload`
   - The backend runs on `http://127.0.0.1:8000`

### Frontend Setup
1. Navigate to the frontend directory: `cd app/frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
   - The frontend runs on `http://localhost:3000`

## Deployment
- **Frontend**: Can be deployed to Vercel or Netlify effortlessly.
- **Backend**: Can be containerized with Docker or deployed to Google Cloud Run, Render, or Heroku.

## License
MIT License
