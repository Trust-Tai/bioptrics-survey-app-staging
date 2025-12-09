module.exports = {
    apps: [
      {
        name: 'newgold-survey',
        script: 'main.js',
        env: {
          // Local MongoDB connection
          MONGO_URL: 'mongodb://localhost:27017/bioptrics-local',
          ROOT_URL: 'http://localhost:3000',
          PORT: 3000,
          NODE_ENV: 'development',
          DYNAMIC_IMPORTS_URL: 'http://localhost:3000'
        },
        // Production environment (reads from .bashrc environment variables)
        env_production: {
          MONGO_URL: process.env.MONGO_URL,
          ROOT_URL: process.env.ROOT_URL,
          PORT: process.env.PORT || 3000,
          NODE_ENV: 'production',
          DYNAMIC_IMPORTS_URL: process.env.DYNAMIC_IMPORTS_URL
        },
        // Staging environment (reads from .bashrc environment variables)
        env_staging: {
          MONGO_URL: process.env.MONGO_URL_STAGING,
          ROOT_URL: process.env.ROOT_URL_STAGING,
          PORT: process.env.PORT_STAGING || 3001,
          NODE_ENV: 'staging',
          DYNAMIC_IMPORTS_URL: process.env.DYNAMIC_IMPORTS_URL_STAGING
        },
      },
    ],
  };