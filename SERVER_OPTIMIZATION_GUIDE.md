# Server Optimization & Auto-Restart Guide

This guide explains how to run your Jivan Jodi server with production-grade reliability, automatic crash recovery, and zero-downtime deployments.

## 🚀 Features Implemented

### 1. **PM2 Process Manager**
- ✅ Automatic restart on crashes
- ✅ Cluster mode for multi-core CPU utilization
- ✅ Zero-downtime reloads
- ✅ Memory monitoring and auto-restart on memory leaks
- ✅ Process monitoring dashboard
- ✅ Log management

### 2. **Enhanced Error Handling**
- ✅ Graceful shutdown on SIGTERM/SIGINT
- ✅ Uncaught exception handler
- ✅ Unhandled promise rejection handler
- ✅ Database connection retry logic (5 attempts)
- ✅ Proper cleanup of resources on shutdown

### 3. **Health Monitoring**
- ✅ Comprehensive health check endpoint
- ✅ Database connection status
- ✅ Memory usage metrics
- ✅ Process uptime tracking
- ✅ PID and environment info

---

## 📦 Installation

First, install PM2 (if not already installed):

```bash
cd Server
npm install
```

PM2 is now included in your dependencies and will be installed automatically.

---

## 🎯 Usage

### **Development Mode**

For development with auto-reload on file changes:

```bash
npm run dev
```

### **Production Mode with PM2**

#### Start the server:
```bash
npm run pm2:start
```

This will:
- Start the server in cluster mode (using all CPU cores)
- Enable automatic restart on crashes
- Monitor memory usage
- Log all output to `logs/` directory

#### Check server status:
```bash
npm run pm2:status
```

#### View logs:
```bash
npm run pm2:logs
```

#### Monitor in real-time:
```bash
npm run pm2:monit
```

#### Restart the server:
```bash
npm run pm2:restart
```

#### Reload with zero downtime:
```bash
npm run pm2:reload
```

#### Stop the server:
```bash
npm run pm2:stop
```

#### Delete from PM2:
```bash
npm run pm2:delete
```

---

## 🔧 PM2 Configuration

The server is configured via `ecosystem.config.cjs` with the following settings:

### **Auto-Restart Settings**
- **Max Memory**: 500MB (restarts if exceeded)
- **Min Uptime**: 10 seconds (before considering stable)
- **Max Restarts**: 10 consecutive restarts per minute
- **Restart Delay**: 4 seconds between restarts
- **Exponential Backoff**: Enabled for repeated crashes

### **Cluster Mode**
- **Instances**: `max` (uses all CPU cores)
- **Exec Mode**: `cluster` (load balancing across cores)

### **Graceful Shutdown**
- **Kill Timeout**: 5 seconds for graceful shutdown
- **Wait Ready**: Waits for app to send 'ready' signal

---

## 📊 Monitoring

### Health Check Endpoint

Visit: `http://localhost:5000/health`

Response includes:
```json
{
  "success": true,
  "message": "Jivan Jodi API is running",
  "timestamp": "2026-01-27T07:05:03.000Z",
  "uptime": 3600,
  "environment": "production",
  "pid": 12345,
  "memory": {
    "heapUsed": "45MB",
    "heapTotal": "60MB",
    "rss": "80MB"
  },
  "database": "connected"
}
```

### PM2 Monitoring Dashboard

```bash
npm run pm2:monit
```

This shows:
- CPU usage per instance
- Memory usage per instance
- Request rate
- Error rate
- Logs in real-time

---

## 🔄 Auto-Restart Scenarios

The server will automatically restart in these scenarios:

1. **Application Crash**: Uncaught exceptions or unhandled rejections
2. **Memory Leak**: When memory usage exceeds 500MB
3. **Database Connection Loss**: After 5 retry attempts
4. **Port Already in Use**: Exits gracefully with error message
5. **Manual Restart**: Via PM2 commands

### Restart Behavior

- **Immediate Restart**: For crashes (with exponential backoff)
- **Graceful Restart**: Finishes current requests before restarting
- **Zero-Downtime Reload**: Starts new instance before killing old one

---

## 📝 Logs

Logs are stored in the `logs/` directory:

- `pm2-error.log` - Error logs only
- `pm2-out.log` - Standard output logs
- `pm2-combined.log` - All logs combined

### View Logs

```bash
# Tail all logs
npm run pm2:logs

# Clear all logs
npm run pm2:flush

# Or manually clear
npm run logs:clear
```

---

## 🌐 Production Deployment

### On Your Server (Linux/Ubuntu)

1. **Install Node.js and PM2 globally**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

2. **Clone and setup your project**:
```bash
git clone <your-repo>
cd Server
npm install
```

3. **Configure environment**:
```bash
cp .env.example .env
nano .env  # Edit with your production credentials
```

4. **Start with PM2**:
```bash
npm run pm2:start
```

5. **Save PM2 configuration**:
```bash
npm run pm2:save
```

6. **Setup PM2 to start on system boot**:
```bash
npm run pm2:startup
# Follow the instructions shown
```

### On Windows Server

1. **Install PM2**:
```powershell
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

2. **Start the server**:
```powershell
npm run pm2:start
npm run pm2:save
```

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **Rate Limiting**: Already configured (100 requests per 15 minutes)
3. **Helmet**: Security headers enabled
4. **CORS**: Configured for allowed origins only
5. **Input Validation**: Express-validator in use

---

## 🐛 Troubleshooting

### Server won't start

1. **Check if port is in use**:
```bash
# Windows
netstat -ano | findstr :5000

# Linux
lsof -i :5000
```

2. **Check database connection**:
```bash
# Verify MySQL is running
# Check .env credentials
```

3. **Check PM2 logs**:
```bash
npm run pm2:logs
```

### Server keeps restarting

1. **Check error logs**:
```bash
npm run pm2:logs
```

2. **Check memory usage**:
```bash
npm run pm2:monit
```

3. **Increase memory limit** in `ecosystem.config.cjs`:
```javascript
max_memory_restart: '1G'  // Increase from 500M
```

### Database connection issues

The server will automatically retry database connections 5 times with 5-second delays. Check:

1. MySQL is running
2. Credentials in `.env` are correct
3. Database exists
4. User has proper permissions

---

## 📈 Performance Tips

1. **Use Cluster Mode**: Already enabled (uses all CPU cores)
2. **Enable Compression**: Already enabled in app.js
3. **Database Connection Pooling**: Already configured (10 connections)
4. **Rate Limiting**: Prevents abuse
5. **Memory Monitoring**: Auto-restart on memory leaks

---

## 🔄 Update Workflow

When deploying updates:

```bash
# Pull latest code
git pull

# Install new dependencies
npm install

# Reload with zero downtime
npm run pm2:reload
```

This will:
1. Start new instances with updated code
2. Wait for them to be ready
3. Gracefully shutdown old instances
4. No downtime for users!

---

## 📞 Support

For issues or questions:
1. Check logs: `npm run pm2:logs`
2. Check status: `npm run pm2:status`
3. Check health: `http://localhost:5000/health`

---

## 🎉 Summary

Your server is now production-ready with:
- ✅ Automatic crash recovery
- ✅ Zero-downtime deployments
- ✅ Multi-core utilization
- ✅ Memory leak protection
- ✅ Comprehensive logging
- ✅ Health monitoring
- ✅ Graceful shutdowns

**The server will NEVER stay down!** PM2 ensures it automatically restarts on any failure.
