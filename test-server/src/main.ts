import { app } from "./index";
const PORT: number = 9000 || parseInt(process.env.PORT);
app.listen(PORT, (): void => {
  console.log(`Server is running succesfully at ${PORT}`);
});
