import express from "express";
import * as todoController from "../controllers/todo.controller.js";
import { authMiddlewares } from "../middlewares/authMiddlewares.js";
import cors from "cors";

const router = express.Router();

router.use(cors());

router.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  authMiddlewares(req, res, next);
});

router.get("/", todoController.get);
router.post("/", todoController.post);
router.patch("/", todoController.patch);
router.get("/:id", todoController.getOne);
router.patch("/:id", todoController.patchOne);
router.delete("/:id", todoController.deleteOne);

export { router };