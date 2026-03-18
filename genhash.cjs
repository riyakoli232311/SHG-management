const bcrypt = require('bcrypt');
bcrypt.hash('123456', 10).then(hash => {
  console.log(`UPDATE users   SET password_hash = '${hash}';`);
  console.log(`UPDATE members SET password_hash = '${hash}';`);
  console.log(`UPDATE admins  SET password_hash = '${hash}';`);
});