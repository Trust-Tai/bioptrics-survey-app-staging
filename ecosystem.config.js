module.exports = {
    apps: [
      {
        name: 'newgold-survey',
        script: 'main.js',
        env: {
          MONGO_URL: 'mongodb+srv://tayeshobajo:1Manchester_sm%21@cluster.mongodb.net/bioptrics-demo?retryWrites=true&w=majority',
          ROOT_URL: 'https://survey.bioptrics.com',
          PORT: 3000,
        },
      },
    ],
  };