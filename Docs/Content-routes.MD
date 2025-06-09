# 📘 Content Routes Documentation
This document outlines all available routes related to content, likes, and comments.

## 📤 POST /api/v1/content/
Description: Create new content
Access: Protected (Login required)
Middleware: verifyJWT

### Request Body:
```json
{
  "title": "My First Poem",
  "body": "This is the body of the content",
  "type": "POEM"
}
```
### Response:

- 201 Created with newly created content

## 📥 GET /api/v1/content/
Description: Get all content
Access: Public
Query Params (optional): Pagination, search filters

### Response:

- 200 OK with list of all content

## 🔍 GET /api/v1/content/getFilteredContent
Description: Fetch filtered content based on query (e.g. by category, type, etc.)
Access: Public

Example Query:
/api/v1/content/getFilteredContent?type=POEM

### Response:

- 200 OK with matching content list

## 📄 GET /api/v1/content/:id
Description: Get content by its ID
Access: Public

### Response:

- 200 OK with content details

- 404 Not Found if content doesn’t exist

## ✏️ PUT /api/v1/content/:id
Description: Update a specific content
Access: Protected (Login required)
Middleware: verifyJWT

### Request Body:

Fields to be updated

### Response:

- 200 OK on successful update

- 403 Forbidden if user is not owner

## 🗑️ DELETE /api/v1/content/:id
Description: Delete specific content
Access: Protected (Login required)
Middleware: verifyJWT

### Response:

- 200 OK if successfully deleted

- 403 Forbidden if user is not owner

## ❤️ POST /api/v1/content/:id/like
Description: Toggle like/unlike for a content
Access: Protected (Login required)
Middleware: verifyJWT

### Response:

- 200 OK with updated like count

## 💬 POST /api/v1/content/comment/:id
Description: Add a comment to content by content ID
Access: Protected (Login required)
Middleware: verifyJWT

Request Body:
{
  "text": "This is a nice story!"
}
### Response:

- 201 Created with new comment

## 💬 GET /api/v1/content/comment/:id
Description: Get all comments for a specific content ID
Access: Public

### Response:

- 200 OK with list of comments

## 🧹 DELETE /api/v1/content/comment/:id
Description: Delete a comment by its ID
Access: Protected (Login required)
Middleware: verifyJWT
Rules: Only the comment owner can delete

### Response:

- 200 OK if deleted

- 403 Forbidden if not owner

## 🗂️ GET /api/v1/content/all-comments
Description: Get all comments grouped by category (e.g. POEM, STORY)
Access: Public

### Response:
```json
{
  "POEM": [ ...comments ],
  "STORY": [ ...comments ]
}
```
