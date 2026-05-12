# Jivan Jodi Backend API

Backend API for Jivan Jodi Matrimonial Platform built with Node.js, Express, and MySQL.

## Prerequisites

Before running the server, make sure you have:

1. **Node.js** (v16 or higher)
2. **MySQL** (v8 or higher) - Running and accessible
3. **Cloudinary Account** (for image storage)
4. **Razorpay Account** (for payments)
5. **Gmail Account** (for sending emails)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory and add the following:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=jivan_jodi
DB_PORT=3306

# JWT Secrets (use strong random strings)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_refresh_secret_key_minimum_32_characters_long

# Cloudinary (Get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Get from https://dashboard.razorpay.com/app/keys)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Create MySQL Database

Open MySQL and run:

```sql
CREATE DATABASE jivan_jodi;
```

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables in your database.

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## What You Need to Provide

### 1. MySQL Credentials
- **DB_USER**: Your MySQL username (usually `root`)
- **DB_PASSWORD**: Your MySQL password
- **DB_NAME**: Database name (`jivan_jodi`)

### 2. Cloudinary Account
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy: Cloud Name, API Key, API Secret

### 3. Razorpay Account
1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Generate Test/Live keys
4. Copy: Key ID and Key Secret

### 4. Gmail App Password
1. Enable 2-Factor Authentication on your Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an App Password
4. Use this password in EMAIL_PASSWORD

## API Endpoints

Once running, you can test the API:

- **Health Check**: `GET http://localhost:5000/health`

More endpoints will be added as we build the features.

## Folder Structure

```
backend/
├── src/
│   ├── config/          # Database, Cloudinary, Razorpay configs
│   ├── middleware/      # Auth, validation, error handling
│   ├── controllers/     # Business logic
│   ├── routes/          # API routes
│   ├── models/          # Database queries
│   ├── utils/           # Helper functions
│   └── validators/      # Input validation schemas
├── .env                 # Environment variables (create this)
├── .env.example         # Example env file
├── package.json
└── server.js           # Entry point
```

## Next Steps

After setting up:
1. ✅ Server is running
2. ⏳ Create database tables (migrations)
3. ⏳ Build authentication system
4. ⏳ Build profile management
5. ⏳ Integrate payments
