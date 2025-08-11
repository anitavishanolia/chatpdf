## Chat with PDF and Images (pdf-chat)

A Next.js 14 app that lets you upload PDFs or images, then chat with the content. It can summarize pages, answer questions grounded in the selected page, analyze resumes against a job description, generate audio from text, and rewrite code to reduce plagiarism. Uploads are handled via Edge Store and data is stored in Firebase.

### Key Features
- **Chat over PDFs**: Extracts text per page using LangChain `PDFLoader`, maintains short chat history, and streams answers from OpenAI.
- **Ask questions about images**: Uses OpenAI Vision (`gpt-4-vision-preview`) to reason over images and return markdown answers.
- **Resume analysis**: Compares a resume with a job description and returns actionable feedback.
- **Uploads & sharing**: Upload PDFs/images via Edge Store. Public sharing pages are available for viewing and collaboration.

### Tech Stack
| Layer | Technology | What it does |
|---|---|---|
| Frontend | Next.js 14, React 18 | App shell, routing, UI rendering |
| Styling | Tailwind CSS, NextUI | Design system and components |
| Icons/UI | Lucide, Radix UI | Icons and small primitives |
| File Upload | Edge Store | Upload and serve PDF/image files |
| PDF Handling | LangChain `PDFLoader`, `react-pdf` | Load pages, render PDFs in the UI |
| Image Q&A | OpenAI Vision | Understands content from images |
| LLMs | OpenAI Chat Completions | Generates summaries and answers |
| TTS | OpenAI `tts-1` | Generates MP3 files from text |
| State | Zustand | Local app state management |
| Data | Firebase Auth, Firestore, Storage | Auth, message history, and asset storage |
| Deployment | Vercel | Fast serverless hosting |

Optional utilities exist for Google Gemini and Pinecone, but they are not required for the default flow and may not be wired in production routes yet.

### How It Works
1. **Upload**: User uploads a PDF/image to Edge Store from the app.
2. **Processing**:
   - PDFs are fetched as blobs and parsed page-by-page via LangChain `PDFLoader`.
   - Images are passed to OpenAI Vision for multimodal reasoning.
3. **Chat**:
   - Recent chat turns are read from Firestore and included as lightweight context.
   - A request is sent to OpenAI; responses are streamed to the UI in markdown.

### Getting Started
```bash
# Clone
git clone <your-repo-url>
cd pdf-chat

# Install deps
# with yarn
yarn
# or with npm
npm install

# Run dev server
yarn dev
# or
npm run dev
```
Open `http://localhost:3000` in your browser.

### Environment Variables
Create a `.env.local` in the project root and fill as needed.

Required
```bash
# OpenAI
OPENAI_API_KEY=...

# Firebase (Web app config)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Deployment
Deploy to Vercel.
1. Push to a Git repository (GitHub, GitLab, etc.).
2. Import the repo in Vercel.
3. Add the environment variables from above.
4. Deploy.

### Acknowledgements
- OpenAI, Vercel AI SDK
- Edge Store
- Next.js, NextUI, Tailwind CSS
- Firebase
