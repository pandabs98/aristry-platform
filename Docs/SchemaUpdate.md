# 🛠 Prisma Schema Update Guide
This guide helps new developers update the schema for MongoDB and PostgreSQL, regenerate Prisma clients, and apply migrations.


## ✅ 1. Add New Parameters to Prisma Schema

🧾 Mongo Schema Update Example
For MongoDB (No migrations needed):

model Content {
  id        String   @id @default(auto()) @map("_id") @test.ObjectId
  title     String
  body      String
  type      String
  authorId  String
  likes     String[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // 👇 Add new field
  tags      String[] // Example: ["poem", "love", "life"]
}

## ✅ Just save the file. No migration is required for MongoDB (because it’s schemaless).

🧾 Postgres Schema Update Example
For PostgreSQL (Migration needed):

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  // 👇 Add new field
  bio       String?  // Optional field
}

## ✅ 2. Run Generator (after schema changes)

```
npm run generate
or
npx prisma generate
```

## ✅ 3. Run Migration (PostgreSQL only)

```
npm run pg:migrate
or
npx prisma migrate dev --name added-bio-to-user
```

- 🛠 This:

Applies the schema changes to the DB

Creates a new migration file

Updates the dev database

If it’s production, you’ll use:

```
npx prisma migrate deploy

```

## ✅ 4. Open Prisma Studio (for manual data inspection)

```
npm start pg:studio  # Postgres-Sql
npm start mg:studio  # MongoDB
```


## 🧠 Notes for New Developers
Always run npx prisma generate after editing schema.prisma

Only PostgreSQL requires migration; MongoDB does not

Always test your changes locally before deploying

Keep migrations clean and named properly (--name meaningful-change)

✅ You're now ready to safely update your Prisma schema!