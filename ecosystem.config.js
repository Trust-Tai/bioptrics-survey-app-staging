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
        // Production environment (commented out)
        // env_production: {
        //   MONGO_URL: 'mongodb+srv://tayeshobajo:1Manchester_sm@kv8slwx.mongodb.net/bioptrics-demo?retryWrites=true&w=majority',
        //   ROOT_URL: 'https://survey.bioptrics.com',
        //   PORT: 3000,
        //   NODE_ENV: 'production',
        //   DYNAMIC_IMPORTS_URL: 'https://survey.bioptrics.com'
        // },
      },
    ],
  };