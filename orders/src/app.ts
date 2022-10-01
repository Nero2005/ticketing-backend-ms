import express from "express";
import "express-async-errors";
import cookieSession from "cookie-session";
import cors, { CorsOptions } from "cors";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@oo-ticketing-dev/ticketing-common";
import { indexOrderRouter } from "./routes";
import { showOrderRouter } from "./routes/show";
import { newOrderRouter } from "./routes/new";
import { deleteOrderRouter } from "./routes/delete";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
const cookieConfig: CookieSessionInterfaces.CookieSessionOptions = {
  signed: false,
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

app.use(currentUser);

app.use(indexOrderRouter);
app.use(showOrderRouter);
app.use(newOrderRouter);
app.use(deleteOrderRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError("Route");
});

app.use(errorHandler);
export { app };
