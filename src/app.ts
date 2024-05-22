require("dotenv").config();
import express from "express";
import session from "express-session";
import passport from "passport";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({ secret: "supersecret", resave: false, saveUninitialized: true })
);

import initializePassport from "./database/passport";
initializePassport(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/users", userRoutes);

export default app;
