# Backend – E-Commerce API

This folder contains the **Node.js + Express backend** for the E-Commerce Platform.  
It provides APIs for authentication, products, cart, orders, payments, shipments, notifications, and admin management.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Razorpay (Payments)
- Cloudinary (Image Uploads)
- Joi Validation
- Winston Logger
- Rate Limiting

---

## Project Structure

```
src
├── config
├── controllers
├── models
├── routes
├── middlewares
├── services
├── validators
├── utils
├── app.js
└── server.js
```

---

## Setup

Install dependencies

```
npm install
```

Create `.env`

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Run server

```
npm run dev
```

Server runs at

```
http://localhost:5000
```

---

## API Base URL

```
http://localhost:5000/api
```

---

## Main Routes

Auth

```
POST /api/auth/register
POST /api/auth/login
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

Products

```
GET /api/products
GET /api/products/:slug
POST /api/products
```

Cart

```
GET /api/cart
POST /api/cart
PUT /api/cart
```

Orders

```
POST /api/orders
GET  /api/orders/my-orders
```

Payments

```
POST /api/payments/create
POST /api/payments/verify
```

Admin

```
GET /api/admin/stats
GET /api/admin/orders
PATCH /api/admin/orders/:id/status
```

---

## Security

- JWT authentication
- Password hashing (bcrypt)
- Request validation (Joi)
- Rate limiting
- Centralized error handling
- Winston logging

---

**Author:** ARBAZ 