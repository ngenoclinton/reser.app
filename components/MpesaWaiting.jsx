// In MpesaWaiting component
function MpesaWaiting({ timer, amount, onCancel, bookingId, roomId }) {
  const [checking, setChecking] = useState(false);

  const checkNow = async () => {
    setChecking(true);
    const res = await fetch(`/api/payments/status/${bookingId}`);
    const status = await res.json();
    console.log("Manual check:", status);
    setChecking(false);
  };

  return (
    <div className="mt-6 p-6 bg-accent/10 rounded-lg text-center">
      <Smartphone className="mx-auto mb-4 text-primary" size={40} />
      <p className="font-bold">Check your phone</p>
      <p className="text-2xl font-bold text-primary">KES {amount}</p>
      <p className="text-4xl font-mono my-4">
        {String(Math.floor(timer / 60)).padStart(2, "0")}:
        {String(timer % 60).padStart(2, "0")}
      </p>
      <button
        onClick={checkNow}
        disabled={checking}
        className="mb-3 px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        {checking ? "Checking..." : "Check Payment Status"}
      </button>
      <br />
      <button onClick={onCancel} className="text-sm underline text-red-600">
        Cancel & choose another method
      </button>
    </div>
  );
}