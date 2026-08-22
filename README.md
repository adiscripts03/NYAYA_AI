# ⚖️ Nyaya AI

Nyaya AI is an intelligent, agentic legal assistant designed to help Indian citizens and legal professionals navigate their legal rights, draft official documents, and get actionable legal advice. Powered by **LangGraph** and a highly secure multi-tenant architecture, Nyaya AI breaks down complex situations into plain, easy-to-understand guidance or highly technical legal analysis based on your chosen persona.

---

## 🏗 System Architecture

Nyaya AI relies on a modern, robust architecture separating the frontend client from the AI orchestration backend. It leverages powerful managed services for authentication, caching, and persistence.

```mermaid
graph TD
    subgraph Frontend [Client Layer]
        UI[React Frontend (Vite)]
        Router[React Router]
    end

    subgraph Backend [API & Orchestration Layer]
        API[Express.js / Node.js]
        Graph[LangGraph Engine]
        API <--> Graph
    end

    subgraph Data [Data & Auth Layer]
        Auth[Supabase Auth]
        DB[(PostgreSQL DB / Supabase)]
        Cache[(Upstash Redis Cache)]
        ORM[Prisma ORM]
    end

    subgraph External [External Services]
        LLM_Groq[Groq API / Llama 3]
        LLM_Mistral[Mistral API]
        Kanoon[Indian Kanoon API]
    end

    UI <-->|REST API / JWT| API
    UI <-->|Auth Verification| Auth
    
    API <-->|Validate & Query| ORM
    ORM <--> DB
    API <-->|Session / API Caching| Cache
    
    Graph <-->|Inference| LLM_Groq
    Graph <-->|Fallback| LLM_Mistral
    Graph <-->|Legal Research| Kanoon
```

### Core Technologies:
- **Frontend**: React, Vite, React Router, Lucide Icons, React-Markdown, Vanilla CSS (Glassmorphism & Custom Design System).
- **Backend**: Node.js, Express, TypeScript, `tsx`, Prisma ORM.
- **Database & Auth**: PostgreSQL (Supabase), Supabase Auth (ES256 JWKS validation).
- **Caching**: Redis (Upstash) for Kanoon API queries to reduce latency and API cost.
- **AI Orchestration**: LangChain, LangGraph (`@langchain/langgraph`).
- **LLM Providers**: Groq (Llama 3 / OSS Models) for blazing fast inference, Mistral (Fallback).

---

## 🧠 LangGraph Pipeline (AI Orchestrator)

Nyaya AI isn't just a simple prompt wrapper. It uses a **Directed Acyclic Graph (DAG)** built with LangGraph to route your legal query through specialized AI agents. This guarantees high-quality, verified, and strictly formatted advice.

### The Pipeline Architecture

```mermaid
graph TD
    User([User Query]) --> Triage[Triage Agent]
    
    Triage -->|General Chat| Conversational[Conversational Agent]
    Conversational --> End([Final Response])
    
    Triage -->|Legal Query| FactExtractor[Fact Extraction Agent]
    
    FactExtractor -->|Error| FactExtractor
    FactExtractor -->|Success/Fallback| KanoonAPI[Kanoon API Agent]
    
    KanoonAPI -->|Precedents & Statutes| LegalAdvisor[Legal Advisor Agent]
    LegalAdvisor --> ActionPlan[Action Plan Agent]
    ActionPlan --> RTIAddon[RTI Drafting Addon]
    
    RTIAddon --> FinalResponse([Final Formatted Response])

    style Triage fill:#2F5A4E,stroke:#fff,stroke-width:2px,color:#fff
    style FactExtractor fill:#1F4B6E,stroke:#fff,stroke-width:2px,color:#fff
    style KanoonAPI fill:#1F4B6E,stroke:#fff,stroke-width:2px,color:#fff
    style LegalAdvisor fill:#C86650,stroke:#fff,stroke-width:2px,color:#fff
    style ActionPlan fill:#C86650,stroke:#fff,stroke-width:2px,color:#fff
    style RTIAddon fill:#725b8a,stroke:#fff,stroke-width:2px,color:#fff
```

### Node-by-Node Breakdown
1. **Triage Agent (`triageNode`)**: The entry point. It classifies the user's message into legal categories (Criminal, Civil, Family, etc.). Crucially, it detects **context switches**—if the user was talking about a landlord and suddenly asks about domestic violence, it instructs downstream agents to focus on the new topic without discarding history.
2. **Conversational Agent (`conversationalNode`)**: If the triage agent determines the user is just saying "Hello" or engaging in general chat, this node handles it directly, bypassing expensive legal processing.
3. **Fact Extractor (`factExtractorNode`)**: Uses strict JSON extraction (`zod` schema) to pull out hard facts (incident type, dates, parties involved) stripped of emotion. *It features a conditional edge retry loop* if the LLM fails to output valid JSON.
4. **Kanoon API Agent (`kanoonAPINode`)**: Takes the extracted facts and queries the `api.indiankanoon.org` search endpoint. It caches results in Upstash Redis for 24 hours to accelerate repeated queries.
5. **Legal Advisor (`legalAdvisorNode`)**: The core RAG (Retrieval-Augmented Generation) node. It dynamically alters its system prompt based on the user's active **Persona**:
   - *Citizen Mode*: Explains the situation in simple English while authenticating advice with specific Sections/Acts.
   - *Lawyer Mode*: Highly technical analysis with deep citations of BNS, IPC, CrPC, etc.
6. **Action Plan Agent (`actionPlanNode`)**: Synthesizes the legal advice into 3-5 concrete, actionable bullet points, enforcing the inclusion of official Government of India portal URLs (e.g., cybercrime.gov.in).
7. **RTI Drafting Addon (`rtiAddonNode`)**: Analyzes the final advice to see if an RTI (Right to Information) application is applicable (e.g., if the grievance is against a public/government body). If yes, it proactively drafts an RTI structure.

---

## ✨ Features

- **Dual Personas (Citizen vs. Lawyer)**: Switch seamlessly between plain-English citizen advice and highly technical legal language with the click of a button in the sidebar.
- **RTI & Bail Drafters**: Dedicated wizards that take raw, messy input and output highly formal, specific, and legally sound documents.
- **My Cases**: A dashboard where every chat session and drafted document is securely isolated to your account.
- **Secure Authentication**: Built with Supabase Auth, supporting Email/Password, Email OTPs, and OAuth.
- **Data Privacy & Multi-Tenancy**: Enforced via Prisma and PostgreSQL, ensuring users only access their own data.
- **Beautiful UI**: A clean, spacious, glassmorphic frontend built with React, featuring full Markdown support, fully responsive layouts, and dynamic Dark/Light modes.

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18+)
- A **Supabase** Account (for Auth and PostgreSQL)
- An **Upstash** Account (for Redis Caching)
- API Keys: **Groq**, **Mistral** (fallback), and **Indian Kanoon**.

---

### 1. Backend Setup

Navigate to the `backend` directory, install dependencies, and configure your environment.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
# -----------------------------
# SUPABASE & DATABASE CONFIG
# -----------------------------
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Transaction connection pooler string
DATABASE_URL="postgresql://postgres.xxx:password@aws-0.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Session connection string (for Prisma migrations)
DIRECT_URL="postgresql://postgres.xxx:password@aws-0.pooler.supabase.com:5432/postgres"

# -----------------------------
# REDIS CACHE
# -----------------------------
REDIS_URL="rediss://default:your_password@your-upstash-url.upstash.io:6379"

# -----------------------------
# AI & EXTERNAL APIS
# -----------------------------
GROQ_API_KEY="gsk_your_groq_key"
MISTRAL_API_KEY="your_mistral_key"
KANOON_API_TOKEN="your_kanoon_api_token"

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

### 3. Run with Docker Compose (Alternative)

If you prefer to run the entire stack (Frontend + Backend) using Docker, use the provided `docker-compose.yml`.

Ensure Docker is installed and your `.env` files are created in both `/frontend` and `/backend` as described above.

```bash
# Build and start the containers in the background
docker compose up --build -d

# View logs
docker compose logs -f
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8000`. Changes to your code will auto-reload via volume mounts.

---

## 📄 License
This project is licensed under the MIT License.
