module.exports = {
    apps: [
      {
        name: 'newgold-survey',
        script: 'main.js',
        env: {
          MONGO_URL: 'mongodb://tayeshobajo:1Manchester_sm%21@bioptrics-demo.kv8slwx.mongodb.net/?retryWrites=true&w=majority&appName=bioptrics-demo',
          ROOT_URL: 'https://survey.bioptrics.com',
          PORT: 3000,
          NODE_ENV: 'production'
        },
      },
    ],
  };