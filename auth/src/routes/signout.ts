import express, { Request, Response } from "express";

const router = express.Router();

router.post("/api/users/signout", (req: Request, res: Response) => {
  req.session = null;
  return res.json({ message: "Signed out successfully" });
});

export { router as signoutRouter };
