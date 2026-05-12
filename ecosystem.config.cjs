/**
 * PM2 Ecosystem Configuration
 * This file configures PM2 for production-grade process management
 * with automatic restarts, clustering, and monitoring
 */

module.exports = {
  apps: [
    {
      // Application Configuration
      name: 'jivan-jodi-api',
      script: './server.js',
      
      // Execution Mode
      instances: 'max', // Use all available CPU cores (cluster mode)
      exec_mode: 'cluster', // Enable cluster mode for better performance
      
      // Environment Variables
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      
      // Auto Restart Configuration
      autorestart: true, // Automatically restart if app crashes
      watch: false, // Disable file watching in production (enable in dev if needed)
      max_memory_restart: '500M', // Restart if memory exceeds 500MB
      
      // Restart Strategy
      min_uptime: '10s', // Minimum uptime before considering app stable
      max_restarts: 10, // Maximum consecutive restarts within 1 minute
      restart_delay: 4000, // Delay between restarts (4 seconds)
      
      // Exponential Backoff Restart
      exp_backoff_restart_delay: 100, // Starting delay for exponential backoff
      
      // Graceful Shutdown
      kill_timeout: 5000, // Time to wait for graceful shutdown (5 seconds)
      wait_ready: true, // Wait for app to send 'ready' signal
      listen_timeout: 10000, // Timeout for app to listen (10 seconds)
      
      // Error Handling
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true, // Prefix logs with timestamp
      
      // Advanced Options
      merge_logs: true, // Merge logs from all instances
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Source Map Support
      source_map_support: true,
      
      // Instance Variables
      instance_var: 'INSTANCE_ID',
      
      // Cron Restart (optional - restart daily at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Post-Deploy Actions (optional)
      // post_update: ['npm install', 'echo Deployment completed'],
    }
  ],

  // Deployment Configuration (optional - for automated deployments)
  deploy: {
    production: {
      user: 'node',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
};
