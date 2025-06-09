# 👤 User Routes Documentation

This document outlines all available routes related to user registration, authentication, profile updates, and account management.

---

## 📝 POST `/api/v1/users/register`

**Description:** Register a new user with optional avatar and cover image uploads  
**Access:** Public

**Middleware:**  
- `upload.fields([{ name: "avatar" }, { name: "coverImage" }])`

### 📤 Request Body:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "password": "yourPassword"
}
```
### 📎 Uploads:
avatar (image file)

coverImage (image file)

### ✅ Response:
201 Created with user data and access token

## 🔐 POST /api/v1/users/login
Description: Login an existing user
Access: Public

### 📤 Request Body:
``` json
{
  "email": "john@example.com",
  "password": "yourPassword"
}

```
### ✅ Response:
200 OK with user data and access token

## 🚪 POST /api/v1/users/logout
Description: Logout the current user
Access: Protected
Middleware: verifyJWT

### ✅ Response:
200 OK with success message

## 🔑 POST /api/v1/users/change-password
Description: Change the current user's password
Access: Protected
Middleware: verifyJWT

### 📤 Request Body:
``` json
{
  "oldPassword": "currentPassword",
  "newPassword": "newSecurePassword"
}
```
### ✅ Response:
200 OK if password changed

## 👤 GET /api/v1/users/current-user
Description: Get currently logged-in user's profile
Access: Protected
Middleware: verifyJWT

### ✅ Response:
200 OK with user info

### ✏️ PATCH /api/v1/users/update-account
Description: Update account details like fullName, email, or username
Access: Protected
Middleware: verifyJWT

## 📤 Request Body (any field is optional):
```json
{
  "fullName": "New Name",
  "email": "new@example.com",
  "username": "newUsername"
}
```
## ✅ Response:
200 OK with updated user info

## 🖼️ POST /api/v1/users/update-avatar
Description: Update the user’s avatar image
Access: Protected
Middleware:

upload.fields([{ name: "avatar" }])

verifyJWT

📎 Upload:
avatar (image file)

### ✅ Response:
200 OK with updated avatar info

## 🖼️ POST /api/v1/users/update-cover-image
Description: Update the user’s cover image
Access: Protected
Middleware:

upload.fields([{ name: "coverImage" }])

verifyJWT

### 📎 Upload:
coverImage (image file)

### ✅ Response:
200 OK with updated cover image info

## ❌ POST /api/v1/users/deleteUser
Description: Delete the current user account
Access: Protected
Middleware: verifyJWT (you should add it for safety if not already)

### ✅ Response:
200 OK with deletion confirmation