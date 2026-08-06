import { Router, type IRouter } from "express";
import healthRouter from "./health";
import retreatCentreRouter from "./retreatCentre";

const router: IRouter = Router();

router.use(healthRouter);
router.use(retreatCentreRouter);

export default router;
