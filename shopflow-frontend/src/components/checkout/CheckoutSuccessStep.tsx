const CheckoutSuccessStep = () => (
  <div className="min-h-screen flex items-center justify-center px-6">
    <div className="max-w-md w-full text-center">
      <div className="w-24 h-24 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-5xl">🎉</span>
      </div>
      <h1 className="text-3xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
        Order Confirmed!
      </h1>
      <p className="text-text-secondary mb-2">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
      <p className="text-sm text-text-muted mb-8">Redirecting to your order...</p>
      <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
    </div>
  </div>
);

export default CheckoutSuccessStep;
