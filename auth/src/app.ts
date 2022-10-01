import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import cors, { CorsOptions } from "cors";
import {
  errorHandler,
  NotFoundError,
} from "@oo-ticketing-dev/ticketing-common";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
const cookieConfig: CookieSessionInterfaces.CookieSessionOptions = {
  signed: false,
  expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
};
if (process.env.NODE_ENV === "production") {
  cookieConfig.secure = true;
  cookieConfig.sameSite = "none";
} else {
  cookieConfig.sameSite = false;
}
console.log(process.env.NODE_ENV);

app.use(cookieSession(cookieConfig));
const allowedOrigins = [
  "http://localhost:3000",
  "https://ticketing-frontend.vercel.app",
];
const corsOption: CorsOptions = {
  origin: (
    requestOrigin: string | undefined,
    callback: (b: Error | null, c: boolean) => void
  ) => {
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!requestOrigin) return callback(null, true);
    if (allowedOrigins.indexOf(requestOrigin) === -1) {
      let msg =
        "The CORS policy for this site does not " +
        "allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
  credentials: true,
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOption));

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError("Route");
});

app.use(errorHandler);
export { app };
