import app from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`API ejecutandose en http://localhost:${config.port}`);
});
