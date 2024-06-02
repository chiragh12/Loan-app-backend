import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
});

const loanSchema = new mongoose.Schema(
  {
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loanAmount: { type: Number, required: true },
    totalLoanAmount: { type: Number, required: true },
    loanReturnStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    installments: [installmentSchema],
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
