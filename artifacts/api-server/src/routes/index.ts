import { Router, type IRouter } from "express";
import healthRouter from "./health";
import platformRouter from "./platform";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(platformRouter);
router.use(storageRouter);

export default router;
