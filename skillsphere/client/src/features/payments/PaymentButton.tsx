import API from "../../services/api";

// Declare Razorpay type on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Props type
interface PaymentButtonProps {
  amount: number;
  jobId: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ amount, jobId }) => {
  const handlePayment = async () => {
    try {
      const { data: order } = await API.post("/payments/create-order", { amount, jobId });

      const options = {
        key: import.meta.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "SkillSphere",
        description: "Job Payment",
        handler: async function (response: any) {
          await API.post("/payments/verify", response);
          alert("Payment Successful!");
        },
        theme: { color: "#0ea5e9" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-green-600 px-6 py-2 rounded hover:bg-green-700"
    >
      Pay ₹{amount}
    </button>
  );
};

export default PaymentButton;