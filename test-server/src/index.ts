import express, { Application, Response, Request, Router } from "express";
import cors from "cors";

export const app: Application = express();
const router: Router = Router();

// Middlewares
app.use(express.json());
app.use(cors());

//Router
app.use(router);

router.get("/", (req: Request, res: Response) => {
  console.log("hello!");
});
