import createApp from "./app.js";
import { connectDB } from "./lib/db.js";

const PORT = Number(process.env.PORT || 5000);
const app = await createApp();

const startServer = async () => {
  try {
    await connectDB();
    await app.listen(PORT, "0.0.0.0");
    console.log("server running on port " + PORT);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
