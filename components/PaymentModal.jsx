"use client"

import { useState } from "react"
import { CreditCard, Smartphone, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

export default function PaymentModal({ isOpen, onClose, booking, depositAmount, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  })
  const [mpesaPhone, setMpesaPhone] = useState("")

  const handleCardChange = (e) => {
    const { name, value } = e.target
    setCardData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCardPayment = async () => {
    if (!cardData.cardNumber || !cardData.cardName || !cardData.expiry || !cardData.cvv) {
      toast.error("Please fill in all card details")
      return
    }

    setIsProcessing(true)
    try {
      // In a real implementation, this would call your payment processor (Stripe, etc.)
      // For now, we'll simulate the payment
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast.success(`Payment of $${depositAmount.toFixed(2)} processed successfully!`)
      onPaymentSuccess("card", `card_${Date.now()}`)
      onClose()
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMpesaPayment = async () => {
    if (!mpesaPhone) {
      toast.error("Please enter M-Pesa phone number")
      return
    }

    setIsProcessing(true)
    try {
      // In a real implementation, this would integrate with M-Pesa API
      // For now, we'll simulate the payment
      await new Promise((resolve) => setTimeout(resolve, 3000))

      toast.success(`M-Pesa payment of $${depositAmount.toFixed(2)} initiated! Check your phone.`)
      onPaymentSuccess("mpesa", `mpesa_${Date.now()}`)
      onClose()
    } catch (error) {
      console.error("M-Pesa error:", error)
      toast.error("M-Pesa payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>Pay 50% deposit to confirm your booking</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Booking Summary */}
          <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg">
            <p className="text-sm text-foreground/60 mb-2">Booking Summary</p>
            <p className="font-semibold text-foreground">{booking.room_name}</p>
            <div className="mt-3 pt-3 border-t border-secondary/20 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Total Amount:</span>
                <span className="font-semibold">${booking.total_amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-accent font-semibold">50% Deposit:</span>
                <span className="font-bold text-accent text-lg">${depositAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card" className="gap-2">
                <CreditCard size={16} />
                Card
              </TabsTrigger>
              <TabsTrigger value="mpesa" className="gap-2">
                <Smartphone size={16} />
                M-Pesa
              </TabsTrigger>
            </TabsList>

            {/* Card Payment */}
            <TabsContent value="card" className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Cardholder Name</label>
                <Input
                  name="cardName"
                  value={cardData.cardName}
                  onChange={handleCardChange}
                  placeholder="John Doe"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Card Number</label>
                <Input
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleCardChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Expiry Date</label>
                  <Input
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">CVV</label>
                  <Input
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    maxLength="3"
                    type="password"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <Button
                onClick={handleCardPayment}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isProcessing ? "Processing..." : `Pay $${depositAmount.toFixed(2)}`}
              </Button>
            </TabsContent>

            {/* M-Pesa Payment */}
            <TabsContent value="mpesa" className="space-y-4 mt-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Enter your M-Pesa registered phone number. You'll receive a prompt on your phone.
                </AlertDescription>
              </Alert>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Phone Number</label>
                <Input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="+254712345678"
                  disabled={isProcessing}
                />
              </div>

              <Button
                onClick={handleMpesaPayment}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isProcessing ? "Processing..." : `Pay $${depositAmount.toFixed(2)} via M-Pesa`}
              </Button>
            </TabsContent>
          </Tabs>

          {/* Security Note */}
          <p className="text-xs text-foreground/60 text-center">Your payment information is secure and encrypted</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
