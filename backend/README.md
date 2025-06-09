# 🧩 Artistry Backend

This is the backend for the Artistry project, built using:

- 🛠 **Prisma ORM** for both **PostgreSQL** and **MongoDB**
- ☁️ **Cloudinary** for media uploads
- 🗂 **Multer** for handling file uploads
- 🔐 **bcrypt**, **jsonwebtoken** for authentication
- 🍪 **cookie-parser** for managing cookies
- 🌐 **CORS** and **dotenv** for smooth development

---

## 📁 Project Structure

backend/
│
├── prisma/
│ ├── postgres/
│ │ └── schema.prisma
│ └── mongodb/
│ └── schema.prisma
│
├── generated/
│ ├── postgres-client/
│ └── mongo-client/
│
├── src/
│ ├── db/
│ │ ├── pg.js
│ │ └── mongo.js
│ └── ...
│
├── .env
└── package.json


---

## ⚙️ Installation

```bash
git clone https://github.com/pandabs98/aristry-platform.git
cd backend
npm install
```

## 🔐 Environment Variables
Create a .env file in the root directory with the following content:

### Server
PORT=5000
CORS_ORIGIN=*

### PostgreSQL
POSTGRES_URL="postgresql://username:password@localhost:5432/database"

### MongoDB
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"

### JWT
JWT_SECRET="your-secret-key"

### Cloudinary 
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"


## 🔧 Generate Prisma Clients
Run these commands to generate Prisma clients:
npx prisma generate --schema=prisma/postgres/schema.prisma
npx prisma generate --schema=prisma/mongodb/schema.prisma

## 🚀 Run the Project
npm start
Your server will run on http://localhost:<PORT> (default: 4001).

## 📦 Dependencies Used
prisma

@prisma/client

multer

cloudinary

express

bcrypt

cors

helmet

cookie-parser

jsonwebtoken

nodemailer

dotenv

nodemon

prettier

## 📌 Future Improvements
Role-based access system

Queue system for donations

Admin dashboard

Read allowed option

## 🧠 Notes
Prisma clients are generated to generated/postgres-client and generated/mongo-client.

Remember to re-run npx prisma generate after changing any .prisma file.

Built with 💛 by Bhagyashwariya Panda