# 🧩 Bitespeed Backend Task -- Identity Reconciliation

## 📌 Overview

This project implements the **Identity Reconciliation** system using:

-   **Node.js + TypeScript**
-   **Express.js**
-   **Supabase (PostgreSQL)**

It follows the Bitespeed requirements:

-   Link contacts using **email** and/or **phoneNumber**
-   Maintain **Primary ↔ Secondary** relationship
-   Always return the **oldest contact as Primary**
-   Prevent duplicate identities

------------------------------------------------------------------------

## ⚙️ Tech Stack

-   Node.js
-   TypeScript
-   Express
-   Supabase
-   PostgreSQL

------------------------------------------------------------------------

## 📂 Project Structure

    src/
     ├── index.ts
     ├── routes/
     │    └── identify.ts
     ├── services/
     │    └── identity.service.ts
     ├── lib/
     │    └── supabase.ts

------------------------------------------------------------------------

## 🗄️ Database Schema (Supabase)

### Table: `Contact`

| Column        | Type       | Description            |
|---------------|------------|------------------------|
| id            | UUID / INT | Primary Key            |
| email         | TEXT       | Nullable               |
| phoneNumber   | TEXT       | Nullable               |
| linkedId      | UUID / INT | Points to Primary      |
| linkPrecedence| TEXT       | Primary / Secondary    |
| createdAt     | TIMESTAMP  | Record creation time   |
| updatedAt     | TIMESTAMP  | Auto updated           |

------------------------------------------------------------------------

## 🔑 Business Rules

### 1️⃣ If no match found

➡️ Create a **new Primary contact**

### 2️⃣ If match found

➡️ Return the **existing Primary** with all linked data

### 3️⃣ If email & phone match different Primaries

➡️ Convert the **newer Primary → Secondary** ➡️ Link it to the **oldest
Primary**

### 4️⃣ If only one field matches

➡️ Create a **Secondary contact** linked to Primary

------------------------------------------------------------------------

------------------------------------------------------------------------

## 🧠 Identity Resolution Flow

1.  Fetch all contacts where\
    `email = input.email OR phoneNumber = input.phoneNumber`

2.  Sort by:

``` ts
.order("createdAt", { ascending: true })
```

3.  Determine **Primary contact**
4.  Merge identities if multiple primaries exist
5.  Insert Secondary if new combination appears
6.  Return aggregated response

------------------------------------------------------------------------

## 🚀 Getting Started

### 1️⃣ Install dependencies

``` bash
npm install
```

### 2️⃣ Setup `.env`

    SUPABASE_URL=your_url
    SUPABASE_ANON_KEY=your_key
    PORT=3000

### 3️⃣ Run server

``` bash
npm run dev
```

------------------------------------------------------------------------

## 🧪 Testing

Use Postman / Thunder Client:

    POST https://bitespeed-assessment-xks4.onrender.com/api/v1/identify

Test cases:

-   New email + phone → New Primary
-   same email + same phone → same data
-   Same email, new phone → Secondary
-   Same phone, new email → Secondary
-   Email & phone linked to different Primaries → Merge

------------------------------------------------------------------------

## ⚠️ Important Notes

-   Always return **oldest contact as Primary**
-   Never create duplicate Primary
-   Always aggregate:
    -   All emails
    -   All phoneNumbers
    -   All secondaryContactIds

------------------------------------------------------------------------

------------------------------------------------------------------------

## 👨‍💻 Author

**Arshad Jamil**\
Backend Developer (TypeScript \| Supabase \| MERN)

------------------------------------------------------------------------
