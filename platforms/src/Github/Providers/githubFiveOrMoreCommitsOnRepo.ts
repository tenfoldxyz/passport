// ----- Types
import type { ProviderContext, RequestPayload, VerifiedPayload } from "@gitcoin/passport-types";
import type { Provider, ProviderOptions } from "../../types";
import { requestAccessToken } from "./github";

// ----- HTTP Client
import axios from "axios";

export type GithubTokenResponse = {
  access_token: string;
};

export type GithubFindMyUserCommitsResponse = { commits?: string[] };

// Export a Github Provider to carry out OAuth, check if the user has 5 >= repos,
// and return a record object
export class FiveOrMoreCommitsOnGithubRepo implements Provider {
  // Give the provider a type so that we can select it with a payload
  type = "FiveOrMoreCommitsOnRepo";

  // Options can be set here and/or via the constructor
  _options = {};

  // construct the provider instance with supplied options
  constructor(options: ProviderOptions = {}) {
    this._options = { ...this._options, ...options };
  }

  // verify that the proof object contains valid === "true"
  async verify(payload: RequestPayload, context: ProviderContext): Promise<VerifiedPayload> {
    let valid = false,
      verifiedPayload: GithubFindMyUserCommitsResponse = {};

    try {
      verifiedPayload = await verifyGithubCommitsOnRepo(
        payload.proofs.code,
        payload.proofs.ownerUsername,
        payload.proofs.repoName,
        payload.proofs.authorUsername,
        context
      );
    } catch (e) {
      return { valid: false };
    } finally {
      valid = verifiedPayload && verifiedPayload.commits.length >= 5 ? true : false;
    }

    return {
      valid: valid,
      record: {
        //HACK: Figure out better unique id
        id: verifiedPayload.commits[0] + "gte5commits",
      },
    };
  }
}

// const requestAccessToken = async (code: string): Promise<string> => {
//   const clientId = process.env.GITHUB_CLIENT_ID;
//   const clientSecret = process.env.GITHUB_CLIENT_SECRET;

//   // Exchange the code for an access token
//   const tokenRequest = await axios.post(
//     `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`,
//     {},
//     {
//       headers: { Accept: "application/json" },
//     }
//   );

//   if (tokenRequest.status != 200) {
//     throw `Post for request returned status code ${tokenRequest.status} instead of the expected 200`;
//   }

//   const tokenResponse = tokenRequest.data as GithubTokenResponse;

//   return tokenResponse.access_token;
// };

const verifyGithubCommitsOnRepo = async (
  code: string,
  repoName: string,
  ownerUsername: string,
  authorUsername: string,
  context: ProviderContext
): Promise<GithubFindMyUserCommitsResponse> => {
  // retrieve user's auth bearer token to authenticate client
  const accessToken = await requestAccessToken(code, context);

  // Now that we have an access token fetch the user details
  const userCommitsRequest = await axios.get(
    `https://api.github.com/repos/${ownerUsername}/${repoName}/commits/?${authorUsername}`,
    {
      headers: { Authorization: `token ${accessToken}` },
    }
  );

  if (userCommitsRequest.status != 200) {
    throw `Get user commits request returned status code ${userCommitsRequest.status} instead of the expected 200`;
  }
  //TODO:Fix typings
  return userCommitsRequest as GithubFindMyUserCommitsResponse;
};
