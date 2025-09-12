# Local MongoDB Setup Guide

## Prerequisites

1. **Install MongoDB locally:**
   ```bash
   # On macOS with Homebrew
   brew install mongodb-community
   
   # On Ubuntu/Debian
   sudo apt-get install mongodb
   
   # On Windows
   # Download from https://www.mongodb.com/try/download/community
   ```

2. **Start MongoDB service:**
   ```bash
   # On macOS
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   # Start MongoDB service from Services
   ```

## Local Development Setup

### 1. Database Configuration

The project is now configured to use local MongoDB:

- **Database Name:** `bioptrics-local`
- **Connection String:** `mongodb://localhost:27017/bioptrics-local`
- **Port:** 27017 (default MongoDB port)

### 2. Start the Application

```bash
# Option 1: Using npm script (recommended)
npm run start:local

# Option 2: Using npm script with local settings
npm run start:dev

# Option 3: Manual command
MONGO_URL=mongodb://localhost:27017/bioptrics-local meteor run --settings settings.local.json --port 3000 --allow-superuser
```

### 3. Access the Application

- **URL:** http://localhost:3000
- **Admin Login:** Use the default admin credentials from server/main.js

### 4. Verify MongoDB Connection

You can verify the connection by:

1. **Check MongoDB is running:**
   ```bash
   # On macOS/Linux
   ps aux | grep mongod
   
   # Check if MongoDB is listening on port 27017
   lsof -i :27017
   ```

2. **Connect to MongoDB shell:**
   ```bash
   mongo
   # or
   mongosh
   ```

3. **Check if database exists:**
   ```javascript
   use bioptrics-local
   show collections
   ```

## Configuration Files

### ecosystem.config.js
- Updated to use local MongoDB connection
- Production config commented out for safety

### settings.local.json
- Local development settings
- JWT secret for local development

### package.json
- Added `start:local` and `start:dev` scripts
- Easy commands for local development

## Switching Back to Production

To switch back to production MongoDB:

1. **Update ecosystem.config.js:**
   ```javascript
   env: {
     MONGO_URL: 'mongodb+srv://tayeshobajo:1Manchester_sm@kv8slwx.mongodb.net/bioptrics-demo?retryWrites=true&w=majority',
     ROOT_URL: 'https://survey.bioptrics.com',
     NODE_ENV: 'production'
   }
   ```

2. **Use production settings:**
   ```bash
   npm start
   ```

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   brew services list | grep mongodb
   ```

2. **Check MongoDB logs:**
   ```bash
   tail -f /usr/local/var/log/mongodb/mongo.log
   ```

3. **Reset MongoDB:**
   ```bash
   brew services stop mongodb-community
   brew services start mongodb-community
   ```

### Port Issues

If port 3000 is busy:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
meteor run --port 3001
```

## Database Management

### View Collections
```bash
mongo bioptrics-local
db.surveys.find().pretty()
db.users.find().pretty()
```

### Clear Database
```bash
mongo bioptrics-local
db.dropDatabase()
```

### Backup Database
```bash
mongodump --db bioptrics-local --out ./backup
```

### Restore Database
```bash
mongorestore --db bioptrics-local ./backup/bioptrics-local
```


