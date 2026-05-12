#!/bin/bash

# ============================================
# Jivan Jodi Server Management Script
# ============================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to script directory
cd "$(dirname "$0")"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} PM2 is not installed globally."
    echo ""
    echo "Please install PM2 globally first:"
    echo "  npm install -g pm2"
    echo ""
    exit 1
fi

# Parse command
COMMAND=$1

if [ -z "$COMMAND" ]; then
    echo "Usage: ./server-manager.sh [start|stop|restart|reload|status|logs|monit]"
    echo ""
    echo "Commands:"
    echo "  start   - Start the server with PM2"
    echo "  stop    - Stop the server"
    echo "  restart - Restart the server"
    echo "  reload  - Zero-downtime reload"
    echo "  status  - Show server status"
    echo "  logs    - Show server logs"
    echo "  monit   - Open PM2 monitoring dashboard"
    echo ""
    exit 0
fi

case "$COMMAND" in
    start)
        echo -e "${GREEN}Starting Jivan Jodi Server...${NC}"
        npm run pm2:start
        ;;
    stop)
        echo -e "${YELLOW}Stopping Jivan Jodi Server...${NC}"
        npm run pm2:stop
        ;;
    restart)
        echo -e "${YELLOW}Restarting Jivan Jodi Server...${NC}"
        npm run pm2:restart
        ;;
    reload)
        echo -e "${GREEN}Reloading Jivan Jodi Server (zero downtime)...${NC}"
        npm run pm2:reload
        ;;
    status)
        npm run pm2:status
        ;;
    logs)
        npm run pm2:logs
        ;;
    monit)
        npm run pm2:monit
        ;;
    *)
        echo -e "${RED}[ERROR]${NC} Unknown command: $COMMAND"
        echo ""
        echo "Valid commands: start, stop, restart, reload, status, logs, monit"
        echo ""
        exit 1
        ;;
esac
