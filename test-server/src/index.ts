import * as dotenv from "dotenv";
import express, { Application, Response, Request, Router } from "express";
import { RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";
import { ethers, providers, Wallet } from "ethers";
import PassportWriter from "@gitcoinco/passport-sdk-writer";
import { DID } from "dids";
import { EthereumAuthProvider } from "@3id/connect";
import {
  FiveOrMoreCommitsOnGithubRepo,
  GithubFindMyUserCommitsResponse,
} from "@gitcoin/passport-platforms/dist/commonjs/Github/Providers/githubFiveOrMoreCommitsOnRepo";
import cors from "cors";

dotenv.config();
export const app: Application = express();
const router: Router = Router();
const githubProvider: FiveOrMoreCommitsOnGithubRepo = new FiveOrMoreCommitsOnGithubRepo();

// Middlewares
app.use(express.json());
app.use(cors());

//Router
app.use(router);

router.get("/", (req: Request, res: Response) => {
  res.send("Hello!");
});

router.get("/auth", (req: Request, res: Response) => {
  const params = {
    scope: "read:user",
    client_id: process.env.GITHUB_CLIENT_ID,
  };
  const urlEncodedParams = new URLSearchParams(params).toString();
  res.redirect(`https://github.com/login/outh/authorize?${urlEncodedParams}`);
});

app.get("/github-callback", (req: Request, res: Response) => {
  const { code } = req.query;
});

router.post("/create-passport", async (req: Request, res: Response): Promise<any> => {
  const provider = new providers.AlchemyProvider("homestead", process.env.ALCHEMY_API_KEY);
  const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

  const testDid: DID = new DID({ provider: new EthereumAuthProvider(provider, wallet.address) });
  await testDid.authenticate();
  const passportWriter: PassportWriter = new PassportWriter(testDid);
  const passportStreamId = await passportWriter.createPassport();
  res.json({ passportStreamId });
});

router.post("/create-credential", async (req: Request, res: Response): Promise<any> => {
  const { code, ...context } = req.query;
  const requestPayload: RequestPayload = {
    type: "",
    address: "",
    version: "",
    proofs: {
      code: code,
    },
  };
  const verfiedPayload: VerifiedPayload = await githubProvider.verify(requestPayload, context);
  res.json(verfiedPayload);
});
