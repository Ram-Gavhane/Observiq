import { createServer } from "./app/server";

const app = createServer();
const port = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
