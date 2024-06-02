import express from "express";
import {
  createLoan,
  getAllLoans,
  getPaidLoans,
  getUnpaidLoans,
  returnLoan,
  getLoansByCNIC,
  getLoansByMonth,
} from "../controllers/loanController.js";

const router = express.Router();

// Route to create a new loan
router.post("/createloan", createLoan);

// Route to get all loans
router.get("/getallloans", getAllLoans);

router.get("/paid", getPaidLoans);

router.get("/unpaid", getUnpaidLoans);

router.post("/:loanId/return", returnLoan);

//filters

router.get("/loans/cnic/:cnic", getLoansByCNIC);
router.get("/loans/month/:year/:month", getLoansByMonth);

export default router;
