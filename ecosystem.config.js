module.exports = {
    apps: [
      {
        name: 'newgold-survey',
        script: 'main.js',
        env: {
          MONGO_URL: 'mongodb://tayeshobajo:1Manchester_sm%21@cluster0-shard-00-00.kv8slwx.mongodb.net:27017,cluster0-shard-00-01.kv8slwx.mongodb.net:27017,cluster0-shard-00-02.kv8slwx.mongodb.net:27017/bioptrics-demo?ssl=true&replicaSet=atlas-kv8slwx-shard-0&authSource=admin&retryWrites=true&w=majority',
          ROOT_URL: 'https://survey.bioptrics.com',
          PORT: 3000,
          NODE_ENV: 'production'
        },
      },
    ],
  };