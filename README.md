# ⚖️ Nyaya AI

Nyaya AI is an intelligent, agentic legal assistant designed to help Indian citizens and legal professionals navigate their legal rights, draft official documents, and get actionable legal advice. Powered by **LangGraph** and a highly secure multi-tenant architecture, Nyaya AI breaks down complex situations into plain, easy-to-understand guidance.

---

## ✨ Features

- **Multi-Agent Legal Chatbot**: A state-of-the-art conversational AI that maintains memory across chats. It automatically analyzes your story, extracts facts, searches legal databases, and generates structured action plans.
- **Dual Personas (Citizen vs. Lawyer)**: Switch seamlessly between plain-English citizen advice and highly technical legal language complete with IPC/BNS sections and case law citations.
- **Secure Authentication**: Built with Supabase Auth, supporting Email/Password, Email OTPs, and Google OAuth.
- **Data Privacy & Multi-Tenancy**: Every chat session and drafted document is securely isolated to the authenticated user via Prisma and PostgreSQL.
- **Document Drafting Wizards**: 
  - **RTI Drafter**: Step-by-step wizard to file Right to Information applications.
  - **Bail Drafter**: Generate formal bail applications with AI-assisted factual refinement.
- **✨ Refine with AI**: Type a messy, raw request into the drafters and let the AI instantly rewrite it into a highly formal, specific, and legally sound document.
- **Beautiful UI**: A clean, spacious, glassmorphic frontend built with React, featuring full Markdown support, dark/light modes, and dynamic routing.

---

## 🧠 Architecture Overview

Nyaya AI uses a modern, separated frontend/backend architecture with an advanced AI orchestration layer.

### System Architecture

```mermaid
graph TD
    Client[React Frontend] -->|REST API / JWT| Backend[Node.js / Express Backend]
    
    Backend -->|Auth Verification| SupabaseAuth[Supabase Auth Server]
    Backend -->|Queries| Prisma[Prisma ORM]
    Prisma -->|PostgreSQL| SupabaseDB[(Supabase DB)]
    Backend -->|Session Caching| Redis[(Upstash Redis)]
    
    Backend -->|LLM Orchestration| LangGraph[LangGraph Engine]
    
    LangGraph -->|LLM Inference| Groq[Groq API / Llama 3]
    LangGraph -->|LLM Fallback| Mistral[Mistral API]
    LangGraph -->|Legal Research| Kanoon[Indian Kanoon API]
```

### Multi-Agent Workflow (LangGraph)

Nyaya AI isn't just a simple prompt wrapper. It uses a **Directed Acyclic Graph (DAG)** to route your legal query through specialized AI agents, ensuring high-quality, verified advice.

```mermaid
graph TD
    User([User Query]) --> Triage[Triage Agent]
    
    Triage -->|Extract Details| FactExtractor[Fact Extraction Agent]
    Triage -->|Search Precedents| KanoonAPI[Indian Kanoon API Agent]
    
    FactExtractor --> LegalAdvisor[Legal Advisor Agent]
    KanoonAPI --> LegalAdvisor
    
    LegalAdvisor --> ActionPlan[Action Plan Agent]
    
    ActionPlan --> Response([Final Formatted Response])

    style Triage fill:#2F5A4E,stroke:#fff,stroke-width:2px,color:#fff
    style LegalAdvisor fill:#C86650,stroke:#fff,stroke-width:2px,color:#fff
    style ActionPlan fill:#C86650,stroke:#fff,stroke-width:2px,color:#fff
```

#### Agent Roles:
1. **Triage Agent**: Determines the category of law (e.g., Civil, Criminal, Corporate).
2. **Fact Extractor**: Strips away emotion and pulls out the hard legal facts, parties involved, and timelines.
3. **Kanoon API Agent**: Searches the Indian Kanoon database for relevant case law and statutes.
4. **Legal Advisor**: Synthesizes the facts and precedents into targeted advice (adapting tone based on the active persona).
5. **Action Plan Agent**: Converts the advice into a strict, bulleted, actionable step-by-step plan with official government portal links.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com) Account (for Auth and PostgreSQL)
- An [Upstash](https://upstash.com/) Account (for Redis)
- A [Groq API Key](https://console.groq.com/) and [Mistral API Key](https://console.mistral.ai/)

---

### 1. Backend Setup

Navigate to the `backend` directory, install dependencies, and configure your environment.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following variables:

```env
# -----------------------------
# SUPABASE & DATABASE CONFIG
# -----------------------------
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Transaction connection pooler string
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Session connection string (for Prisma migrations)
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# -----------------------------
# REDIS CACHE
# -----------------------------
REDIS_URL="rediss://default:your_upstash_password@your-upstash-url.upstash.io:6379"

# -----------------------------
# AI & EXTERNAL APIS
# -----------------------------
GROQ_API_KEY="gsk_your_groq_key"
MISTRAL_API_KEY="your_mistral_key"
KANOON_API_TOKEN="your_kanoon_api_token"
TAVILY_API_KEY="tvly-your_tavily_key"

# -----------------------------
# APP CONFIG
# -----------------------------
FRONTEND_URL="http://localhost:5173"
BACKEND_PORT=8000
```

Sync the Prisma schema to your database and generate the client:
```bash
npx prisma db push
npx prisma generate
```

Start the backend development server:
```bash
npm run dev
```
*(The backend runs on `http://localhost:8000`)*

---

### 2. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, and install dependencies.

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder with your public Supabase credentials:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

Start the React frontend:
```bash
npm run dev
```
*(The frontend runs on `http://localhost:5173`)*

---

### 3. Docker Setup (Alternative)

If you prefer to run the entire stack (Frontend + Backend) using Docker, you can use the provided `docker-compose.yml`.

Ensure Docker is installed and your `.env` files are created in both `/frontend` and `/backend` as described above.

```bash
# Build and start the containers in the background
docker compose up --build -d

# View logs
docker compose logs -f
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8000`. Hot-reloading is enabled automatically via volume mounts!

---

## 🛠 Tech Stack

- **Frontend**: React, Vite, React Router, Lucide Icons, React-Markdown, Vanilla CSS (Glassmorphism & Custom Design System).
- **Backend**: Node.js, Express, TypeScript, `tsx`, Prisma ORM.
- **Database & Auth**: PostgreSQL (Supabase), Supabase Auth (ES256 JWKS validation).
- **Caching**: Redis (Upstash).
- **AI Orchestration**: LangChain, LangGraph (`@langchain/langgraph`).
- **LLM Providers**: Groq (Llama 3 / OSS Models), Mistral (Fallback).

---

## 📄 License
This project is licensed under the MIT License.
