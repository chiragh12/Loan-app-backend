import Loan from "../models/loanSchema.js";
import User from "../models/userSchema.js";

// Function to create a new loan
export const createLoan = async (req, res) => {
  try {
    const { targetUserId, loanAmount } = req.body;

    // Check if the user already has an active loan
    const activeLoan = await Loan.findOne({
      targetUserId,
      loanReturnStatus: { $ne: "paid" },
    });
    if (activeLoan) {
      return res
        .status(400)
        .send({ success: false, message: "User already has an active loan" });
    }

    const loanDuration = 9; // 9 installments as told

    // Calculate interest rate (20% per annum)
    const interestRate = 0.2;
    const totalLoanAmount = loanAmount * (1 + interestRate);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + loanDuration);

    // Calculate installment amounts and due dates (monthly installments)
    const installmentAmount = totalLoanAmount / loanDuration;
    const installments = [];
    for (let i = 0; i < loanDuration; i++) {
      const dueDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        13
      ); // Set due date to the 13th day of each month
      installments.push({
        amount: installmentAmount,
        dueDate,
        status: "unpaid",
      });
    }

    const newLoan = new Loan({
      targetUserId,
      loanAmount,
      totalLoanAmount,
      startDate,
      endDate,
      installments,
      loanReturnStatus: "unpaid",
    });

    await newLoan.save();
    res.status(201).send({
      success: true,
      loan: newLoan,
      message: "Loan added Successfully",
    });
  } catch (error) {
    console.error("Error applying for loan:", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

// Function to get all loans with pagination
export const getAllLoans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const loans = await Loan.find()
      .populate("targetUserId")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).send({
      success: true,
      loans,
      message: "Loans fetched Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

// Function to get paid loans with pagination
export const getPaidLoans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const paidLoans = await Loan.find({ loanReturnStatus: "paid" })
      .populate("targetUserId")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).send({
      success: true,
      loans: paidLoans,
      message: "Paid loans fetched Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

// Function to get unpaid loans with pagination
export const getUnpaidLoans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const unpaidLoans = await Loan.find({ loanReturnStatus: "unpaid" })
      .populate("targetUserId")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).send({
      success: true,
      loans: unpaidLoans,
      message: "Unpaid loans fetched Successfully",
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

export const returnLoan = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Find loan by ID
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res
        .status(404)
        .send({ success: false, message: "Loan not found" });
    }

    // Find the next pending installment to mark as paid
    const nextInstallmentIndex = loan.installments.findIndex(
      (installment) => installment.status === "unpaid"
    );

    if (nextInstallmentIndex === -1) {
      // All installments are already paid, update returnStatus to "paid"
      loan.loanReturnStatus = "paid";
      await loan.save();

      return res
        .status(400)
        .send({ success: false, message: "All installments are already paid" });
    }

    // Check if the due date of the next installment has passed
    const currentDate = new Date();
    const nextInstallmentDueDate =
      loan.installments[nextInstallmentIndex].dueDate;

    if (currentDate > nextInstallmentDueDate) {
      // If the installment is overdue, add it to the next installment
      const overdueInstallmentAmount =
        loan.installments[nextInstallmentIndex].amount;

      // Mark the current installment as paid
      loan.installments[nextInstallmentIndex].status = "paid";

      // Find or create the next installment cycle
      const nextInstallmentCycleIndex = nextInstallmentIndex + 1;
      if (nextInstallmentCycleIndex < loan.installments.length) {
        loan.installments[nextInstallmentCycleIndex].amount +=
          overdueInstallmentAmount;
      } else {
        // Create a new installment cycle if it doesn't exist
        const newDueDate = new Date(nextInstallmentDueDate);
        newDueDate.setMonth(newDueDate.getMonth() + 1); // Set due date to the next month's 13th day
        loan.installments.push({
          amount: overdueInstallmentAmount,
          dueDate: newDueDate,
          status: "unpaid",
        });
      }
    } else {
      // Mark the next installment as paid
      loan.installments[nextInstallmentIndex].status = "paid";
    }

    // Check if all installments are paid
    const allPaid = loan.installments.every(
      (installment) => installment.status === "paid"
    );
    if (allPaid) {
      loan.loanReturnStatus = "paid";
    }

    await loan.save();

    res
      .status(200)
      .send({ success: true, message: "Installment paid successfully", loan });
  } catch (error) {
    console.error("Error returning loan:", error);
    res.status(500).send({ success: false, message: "Internal server error" });
  }
};

export const getLoansByCNIC = async (req, res) => {
  try {
    const { cnic } = req.params;

    // Find the user by CNIC
    const user = await User.findOne({ cnic });

    if (!user) {
      return res.status(200).send({
        success: true,
        loans: [],
        message: `No user found with CNIC ${cnic}`,
      });
    }

    // If user exists, fetch their loans
    const loans = await Loan.find({ targetUserId: user._id }).populate(
      "targetUserId"
    );

    res.status(200).send({
      success: true,
      loans,
      message: `Loans for CNIC ${cnic} fetched Successfully`,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: "Server error", error: error.message });
  }
};

export const getLoansByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;

    // Validate year
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 3000) {
      return res.status(400).send({ message: "Invalid year" });
    }

    // Validate month
    const parsedMonth = parseInt(month);
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).send({ message: "Invalid month" });
    }

    // Create start and end date for the given month
    const startDate = new Date(parsedYear, parsedMonth - 1, 1); // Month is zero-based in JavaScript Date object
    const endDate = new Date(parsedYear, parsedMonth, 0); // Last day of the month

    const loans = await Loan.find({
      "installments.dueDate": { $gte: startDate, $lte: endDate },
    }).populate("targetUserId");

    res.status(200).send({
      success: true,
      loans,
      message: `Loans for ${parsedYear}-${parsedMonth} fetched successfully`,
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};
