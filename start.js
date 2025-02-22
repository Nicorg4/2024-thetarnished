const sequelize = require('./config/database');
const { server } = require('./app');

sequelize.sync()
  .then(() => {
    const port = process.env.PORT || 3000;
    server.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
    console.log('BD connected');
  })
  .catch((err) => {
    console.error('Error connecting to DB:', err);
  });
