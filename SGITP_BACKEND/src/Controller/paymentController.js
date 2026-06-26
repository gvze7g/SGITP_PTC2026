import paymentModel from "../Model/payment.js";

//SELECT
export const getPayment = async (req, res) => {
  const payment = await paymentModel.find();
  res.json(payment);
};

//INSERT
 export const insertPayment = async (req, res) => {
  const {employee_id, period, base_salary, bonuses, retentions, total_paid, payment_date } = req.body;
  const newPayment = new paymentModel({ employee_id, period, base_salary, bonuses, retentions, total_paid, payment_date });
  await newPayment.save();
  res.json({ message: "Payment save" });
};

//UPDATE
export const updatePayment = async (req, res) => {
  const {employee_id, period, base_salary, bonuses, retentions, total_paid, payment_date } = req.body;
  await paymentModel.findByIdAndUpdate(
    req.params.id,
    {
      employee_id,
      period,
      base_salary,
      bonuses,
      retentions,
      total_paid,
      payment_date
    },
    { new: true },
  );

  res.json({ message: "payment updated" });
};

//DELETE
export const deletePayment = async (req, res) => {
  await paymentModel.findByIdAndDelete(req.params.id);
  res.json({ message: "payment deleted" });
};