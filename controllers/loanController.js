import Loan from "../models/loanSchema.js";

// Function to create a new loan
export const createLoan = async (req, res) => {
  try {
    const { targetUserId, loanAmount } = req.body;

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
      ); // Set due date to the 12th day of each month
      installments.push({ amount: installmentAmount, dueDate });
    }

    const newLoan = new Loan({
      targetUserId,
      loanAmount,
      totalLoanAmount: totalLoanAmount,
      startDate,
      endDate,
      installments,
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

// Function to get all loans
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
        newDueDate.setMonth(newDueDate.getMonth() + 1); // Set due date to the next month's 12th day
        loan.installments.push({
          amount: overdueInstallmentAmount,
          dueDate: newDueDate,
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

// Function to get loans by user's CNIC
export const getLoansByCNIC = async (req, res) => {
  try {
    const { cnic } = req.params;

    const loans = await Loan.find({ "targetUserId.cnic": cnic }).populate(
      "targetUserId"
    );

    res.status(200).send({
      success: true,
      loans,
      message: `Loans for CNIC ${cnic} fetched Successfully`,
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};

// Function to get loans by month
export const getLoansByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;

    // Create start and end date for the given month
    const startDate = new Date(year, month - 1, 1); // Month is zero-based in JavaScript Date object
    const endDate = new Date(year, month, 0); // Last day of the month

    const loans = await Loan.find({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    }).populate("targetUserId");

    res.status(200).send({
      success: true,
      loans,
      message: `Loans for ${year}-${month} fetched Successfully`,
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
};
