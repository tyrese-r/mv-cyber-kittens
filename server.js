const app = require('./index');
const { sequelize } = require('./db');

const { PORT = 4002 } = process.env;

app.listen(PORT, () => {
  sequelize.sync({ force: false });
  console.log(`Users are ready at http://localhost:${PORT}`);
});