const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const { ensureAdminUser, ensurePartnerUsers } = require("./services/auth.service");

const port = Number(process.env.PORT) || 5000;

(async () => {
  try {
    await ensureAdminUser();
    await ensurePartnerUsers();

    app.listen(port, () => {
      console.log(`ReVastra backend listening on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error);
    process.exit(1);
  }
})();
