module.exports = {
    apps: [
      {
        name: 'newgold-survey',
        script: 'main.js',
        env: {
          MONGO_URL: 'mongodb://ac-mrflpie-shard-00-00.kv8slwx.mongodb.net:27017,ac-mrflpie-shard-00-01.kv8slwx.mongodb.net:27017,ac-mrflpie-shard-00-02.kv8slwx.mongodb.net:27017/?replicaSet=atlas-vb54yo-shard-0" --ssl --authenticationDatabase admin --username tayeshobajo --password 1Manchester_sm%21',
          ROOT_URL: 'https://survey.bioptrics.com',
          PORT: 3000,
          NODE_ENV: 'production'
        },
      },
    ],
  };