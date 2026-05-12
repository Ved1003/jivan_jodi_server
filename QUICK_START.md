# 🚀 Quick Start Guide - Production Server

## Step 1: Install Dependencies

```bash
cd Server
npm install
```

This will install PM2 and all other dependencies automatically.

## Step 2: Configure Environment

Make sure your `.env` file is properly configured with database credentials.

## Step 3: Start the Server

### Option A: Using NPM Scripts (Recommended)

```bash
# Start in production mode with PM2
npm run pm2:start

# Check status
npm run pm2:status

# View logs
npm run pm2:logs
```

### Option B: Using Management Scripts

**Windows:**
```cmd
server-manager.bat start
server-manager.bat status
```

**Linux/Mac:**
```bash
chmod +x server-manager.sh
./server-manager.sh start
./server-manager.sh status
```

## Step 4: Verify Server is Running

Open your browser and visit:
- Health Check: http://localhost:5000/health

You should see a JSON response with server status and metrics.

## Step 5: Monitor the Server

```bash
# Real-time monitoring dashboard
npm run pm2:monit

# Or view logs
npm run pm2:logs
```

## 🎯 Common Commands

| Command | Description |
|---------|-------------|
| `npm run pm2:start` | Start the server |
| `npm run pm2:stop` | Stop the server |
| `npm run pm2:restart` | Restart the server |
| `npm run pm2:reload` | Zero-downtime reload |
| `npm run pm2:status` | Show server status |
| `npm run pm2:logs` | View logs |
| `npm run pm2:monit` | Monitoring dashboard |

## 🔄 Auto-Restart Features

The server will automatically restart if:
- ✅ Application crashes
- ✅ Uncaught exceptions occur
- ✅ Memory exceeds 500MB
- ✅ Database connection is lost (after retries)

## 📊 What's Running?

PM2 will run your server in **cluster mode** using all available CPU cores for maximum performance and reliability.

## 🛑 Stopping the Server

```bash
npm run pm2:stop
```

To completely remove from PM2:
```bash
npm run pm2:delete
```

## 📖 Need More Help?

See `SERVER_OPTIMIZATION_GUIDE.md` for detailed documentation.

## ⚡ Production Deployment

For production servers, also run:

```bash
# Save PM2 configuration
npm run pm2:save

# Setup auto-start on system boot
npm run pm2:startup
# Follow the instructions shown
```

This ensures your server starts automatically when the system reboots!

---

**That's it! Your server is now running with production-grade reliability! 🎉**
