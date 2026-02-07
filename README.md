# Nobzo Blog API

A simple yet robust REST API for a blog application built with Node.js, Express, and MongoDB. This project includes user authentication (JWT), post management (CRUD), soft deletion, pagination, and filtering capabilities.

## Tech Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM library
- **JWT (JSON Web Tokens)**: Authentication

## Features

- **Authentication**: Register, Login, Logout (JWT).
- **Post Management**: Create, Read, Update, Delete (Soft Delete).
- **Access Control**:
  - Public users can only view published posts.
  - Authenticated users can create posts and manage their own content.
  - Authors can view their own draft posts.
- **Advanced Querying**:
  - Pagination (`page`, `limit`)
  - Search (`title`, `content`)
  - Filtering (`tag`, `author`, `status`)

---

## Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB instance (local or Atlas)

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    cd nobzo-blog
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root directory and add the following:

    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/nobzo-blog
    JWT_SECRET=your_secret_key
    ```

4.  Start the Server:
    ```bash
    npm run server
    ```
    The server will start on `http://localhost:5000`.

---

## Environment Variables

| Variable      | Description                 | Example                                |
| :------------ | :-------------------------- | :------------------------------------- |
| `PORT`        | Port number for the server  | `5000`                                 |
| `MONGODB_URI` | MongoDB connection string   | `mongodb://localhost:27017/nobzo-blog` |
| `JWT_SECRET`  | Secret key for signing JWTs | `mysecretkey`                          |

---

## API Endpoints & Samples

### Authentication

#### Register User

`POST /api/auth/register`

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "60d5ecb8b5c9c62b8c8b4567",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-02-07T10:00:00.000Z"
  }
}
```

#### Login User

`POST /api/auth/login`

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

### Posts

#### Create Post (Auth Required)

`POST /api/posts`
**Header:** `Authorization: Bearer <token>`

**Request:**

```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my first post.",
  "tags": ["tech", "nodejs"],
  "status": "published"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "post created successfully",
  "post": {
    "_id": "60d5ed49b5c9c62b8c8b4568",
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    "content": "This is the content of my first post.",
    "author": "60d5ecb8b5c9c62b8c8b4567",
    "tags": ["tech", "nodejs"],
    "status": "published",
    "createdAt": "2024-02-07T10:05:00.000Z"
  }
}
```

#### Get Posts (Public / Filtered)

`GET /api/posts?page=1&limit=10&search=nodejs`

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ed49b5c9c62b8c8b4568",
      "title": "My First Blog Post",
      "slug": "my-first-blog-post",
      "content": "This is the content of my first post.",
      "author": {
        "_id": "60d5ecb8b5c9c62b8c8b4567",
        "name": "John Doe"
      },
      "tags": ["tech", "nodejs"],
      "status": "published",
      "deletedAt": null,
      "createdAt": "2024-02-07T10:05:00.000Z",
      "updatedAt": "2024-02-07T10:05:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Get Post by Slug

`GET /api/posts/my-first-blog-post`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "60d5ed49b5c9c62b8c8b4568",
    "title": "My First Blog Post",
    "slug": "my-first-blog-post",
    ...
  }
}
```

#### Update Post (Auth Required)

`PUT /api/posts/:id`
**Header:** `Authorization: Bearer <token>`

**Request:**

```json
{
  "title": "Updated Title",
  "status": "published"
}
```

#### Delete Post (Auth Required - Soft Delete)

`DELETE /api/posts/:id`
**Header:** `Authorization: Bearer <token>`

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```
