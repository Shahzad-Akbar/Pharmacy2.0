"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Phone,
  MapPin,
  Clock,
  CreditCard,
  ImageUp,
  UsersRound,
  Truck,
  ShoppingCart,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
}

interface OrderData {
  items: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryCharge: number;
  paymentMethod: string;
  notes: string;
  paymentScreenshot?: string; // Make it optional
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // const [paymentMethod, setPaymentMethod] = useState('COD')
  // const [formData, setFormData] = useState({
  //   name: '',
  //   phone: '',
  //   address: '',
  //   city: '',
  //   state: '',
  //   pincode: '',
  //   deliveryTime: 'morning',
  //   paymentScreenshot: null as File | null  // Correct type definition
  // })
  const [formErrors, setFormErrors] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const validateForm = () => {
    const errors = {
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
      isValid = false;
    }

    if (!/^[\d]{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be 10 digits";
      isValid = false;
    }

    if (!formData.address.trim()) {
      errors.address = "Delivery address is required";
      isValid = false;
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
      isValid = false;
    }

    if (!formData.state.trim()) {
      errors.state = "State is required";
      isValid = false;
    }

    if (!/^[\d]{6}$/.test(formData.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateForm()) {
        setStep(2);
      }
    }
  };

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    deliveryTime: "morning",
    paymentScreenshot: null as File | null, // Correct type definition
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await axios.get("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const items = response.data?.items || [];
        if (items.length === 0) {
          router.push("/cart");
          toast.error("Your cart is empty");
          return;
        }
        setCartItems(items);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to fetch cart items");
        router.push("/cart");
      }
    };

    fetchCartItems();
  }, [router]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const deliveryCharge = 40;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) return;

    if (paymentMethod === "QR" && !formData.paymentScreenshot) {
      toast.error("Please upload payment screenshot");
      setStep(2);
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to place order");
        router.push("/login");
        return;
      }

      const shippingAddress = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      };

      const itemsData = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price * item.quantity,
      }));

      // Initialize orderData with correct typing
      const orderData: OrderData = {
        items: itemsData,
        total,
        shippingAddress,
        deliveryCharge,
        paymentMethod,
        notes: formData.deliveryTime,
      };

      // Add payment screenshot properly
      if (paymentMethod === "QR" && formData.paymentScreenshot) {
        // Convert file to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          orderData.paymentScreenshot = reader.result as string;
        };
        reader.readAsDataURL(formData.paymentScreenshot);
      }

      const response = await axios.post("/api/orders/create", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        toast.success("Order placed successfully!");
        await axios.delete("/api/cart/clear", {
          headers: { Authorization: `Bearer ${token}` },
        });
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // Update file input handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, paymentScreenshot: file });
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading checkout details...</p>
      </div>
    );
  }

  // Function to navigate back to cart
  const handleBackToCart = () => {
    router.push("/cart");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-cyan-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
          <button
            onClick={handleBackToCart}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ShoppingCart size={18} className="mr-1" />
            Back to Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Order Summary
          </h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    width={50}
                    height={50}
                    className="rounded-md"
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-800">
                  ₹{item.product.price * item.quantity}
                </p>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="font-medium text-gray-800">
                  ₹{deliveryCharge}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-2">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">₹{total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          <div
            className={`flex-1 text-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
          >
            <div className="w-8 h-8 rounded-full border-2 mx-auto flex items-center justify-center mb-2">
              1
            </div>
            Details
          </div>
          <div
            className={`flex-1 text-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}
          >
            <div className="w-8 h-8 rounded-full border-2 mx-auto flex items-center justify-center mb-2">
              2
            </div>
            Payment
          </div>
          <div
            className={`flex-1 text-center ${step === 3 ? "text-blue-600" : "text-gray-400"}`}
          >
            <div className="w-8 h-8 rounded-full border-2 mx-auto flex items-center justify-center mb-2">
              3
            </div>
            Confirmation
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Delivery Details */}
          {step === 1 && (
            <div className="bg-white rounded-lg p-6 shadow-md text-gray-800">
              <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <div className="flex items-center">
                    <UsersRound size={20} className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center">
                    <Phone size={20} className="text-gray-400 mr-2" />
                    <input
                      type="tel"
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Delivery Full Address with Landmark
                  </label>
                  <div className="flex items-start">
                    <MapPin size={20} className="text-gray-400 mr-2 mt-2" />
                    <textarea
                      required
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                  />
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Preferred Delivery Time
                  </label>
                  <div className="flex items-center">
                    <Clock size={20} className="text-gray-400 mr-2" />
                    <select
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.deliveryTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryTime: e.target.value,
                        })
                      }
                    >
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">
                        Afternoon (12 PM - 4 PM)
                      </option>
                      <option value="evening">Evening (4 PM - 8 PM)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Payment Method
              </h2>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <div className="flex flex-col space-y-3">
                  {/* COD Option */}
                  <label
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                    ${paymentMethod === 'COD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mr-3 h-4 w-4 text-blue-600"
                    />
                    <div className="flex items-center">
                      <Truck size={24} className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">
                          Cash on Delivery
                        </p>
                        <p className="text-sm text-gray-500">
                          Pay when your order arrives
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* QR Payment Option */}
                  <label
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                    ${paymentMethod === 'QR' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="QR"
                      checked={paymentMethod === "QR"}
                      onChange={() => setPaymentMethod("QR")}
                      className="mr-3 h-4 w-4 text-blue-600"
                    />
                    <div className="flex items-center">
                      <CreditCard size={24} className="text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">
                          Pay Now with QR
                        </p>
                        <p className="text-sm text-gray-500">
                          Scan QR code and pay instantly
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* QR Payment Section - Only show if QR payment method is selected */}
              {paymentMethod === "QR" && (
                <div className="text-center mt-4">
                  <p className="text-gray-600 mb-4">
                    Scan the QR code to make payment
                  </p>
                  <div className="max-w-xs mx-auto mb-4">
                    <Image
                      src="/qr/QR.png"
                      alt="Payment QR Code"
                      width={250}
                      height={250}
                      className="rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    For now Online is unabailable, Please pay in cash
                  </p>
                  {/* Below section is for uploading payment screenshot */}
                  {/* <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                      <ImageUp size={20} />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      name="paymentScreenshot"
                      onChange={handleFileUpload}
                      className="w-full pl-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                  </div> */}
                </div>
              )}

              {/* COD Information - Only show if COD payment method is selected */}
              {paymentMethod === "COD" && (
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-gray-700 mb-2 font-medium">
                    Cash on Delivery Information:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
                    <li>Pay in cash when your order is delivered</li>
                    <li>Please keep exact change ready if possible</li>
                    <li>Our delivery person will provide a receipt</li>
                    <li>You can inspect your items before payment</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // For QR payment, validate screenshot
                    if (paymentMethod === "QR" && !formData.paymentScreenshot) {
                      toast.error("Please Go For Cash On Delivery");
                      return;
                    }
                    setStep(3);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Continue to Confirmation
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {paymentMethod === "COD" ? (
                    <Truck size={32} className="text-green-600" />
                  ) : (
                    <CreditCard size={32} className="text-green-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2 text-green-600">
                  Confirm Your Order
                </h2>
                <p className="text-gray-600">
                  Please review your order details before final confirmation.
                </p>
                <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-700">
                    Payment Method:
                    <span className="ml-2 font-normal">
                      {paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment (QR)"}
                    </span>
                  </p>
                  <p className="font-medium text-gray-700 mt-2">
                    Delivery Address:
                    <span className="ml-2 font-normal text-sm block mt-1">
                      {formData.name}, {formData.phone}
                      <br />
                      {formData.address}, {formData.city},<br />
                      {formData.state} - {formData.pincode}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {submitting ? "Placing Order..." : "Place Order"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg hover:bg-gray-200 disabled:bg-gray-50"
                >
                  Back to Payment
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
