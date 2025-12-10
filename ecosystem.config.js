
module.exports = {
  apps: [
    {
      name: 'bioptrics-survey',
      script: 'main.js',
      cwd: '/var/www/newgold-survey-build/bundle',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        MONGO_URL: process.env.MONGO_URL,
        ROOT_URL: process.env.ROOT_URL,
        PORT: process.env.PORT || 3000,
        NODE_ENV: 'production',
        DYNAMIC_IMPORTS_URL: process.env.DYNAMIC_IMPORTS_URL
      }
    },
    {
      name: 'bioptrics-staging',
      script: 'main.js',
      cwd: '/var/www/bioptrics-staging-build/bundle',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        MONGO_URL: process.env.MONGO_URL_STAGING,
        ROOT_URL: process.env.ROOT_URL_STAGING,
        PORT: process.env.PORT_STAGING || 3001,
        NODE_ENV: 'staging',
        DYNAMIC_IMPORTS_URL: process.env.DYNAMIC_IMPORTS_URL_STAGING
      }
    }
  ]
};