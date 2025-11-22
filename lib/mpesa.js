//--> this file for authentication, timestamp, and password generation.// 

// lib/mpesa.ts
import axios from "axios";
import CryptoJS from "crypto-js";


const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const BASE_URL = "https://sandbox.safaricom.co.ke"; // Change to live in prod
// const CALLBACK_URL = `${process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL}/api/payments/mpesa/callback`;
// const CALLBACK_URL = "https://webhook.site/f65c4eec-0213-4709-ab10-be6138b2cfb6";

// CHANGE THIS TO YOUR REAL URL (ngrok or production)
// const CALLBACK_URL = process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL || 
  const CALLBACK_URL = "https://undeep-rusty-abiogenetically.ngrok-free.dev/api/payments/mpesa/callback";
  
// # API Endpoints (Sandbox – change to /prod for live)
// const MPESA_BASE_URL=`https://sandbox.safaricom.co.ke`
// const MPESA_OAUTH_URL=`/oauth/v1/generate?grant_type=client_credentials`
// const MPESA_STK_URL=`/mpesa/stkpush/v1/processrequest`

let token= null; //accessToken
let tokenExpiry = 0;

// ── Get OAuth Token (expires in 1h) ──────────────────────────
async function getAccessToken() {
  if (token && Date.now() < tokenExpiry) return token;

  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  token = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000); // 1min buffer
  return token;
}

// ── Generate Timestamp ──────────────────────────────────────
function generateTimestamp(){
  return new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14); 
}

// ── Generate Password (Shortcode + Passkey + Timestamp) ─────
function generatePassword(){
  const timestamp = generateTimestamp();
  const plain = `${SHORTCODE}${PASSKEY}${timestamp}`;
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(plain));
}
export async function initiateSTKPush(
  phone,
  amount,
  bookingId,// For reference
){
  try {
    const token = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);//OR=generateTimestamp()
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");//->OR=generatePassword()

    // ── STK Push Implementation ────────────────────────────────
    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: phone,
        PartyB: SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: CALLBACK_URL,
        AccountReference: bookingId,// For reference
        TransactionDesc: `Deposit for booking ${bookingId}`,
      },
      { headers: { Authorization: `Bearer ${token}` }}
    );

    if (data.ResponseCode === "0") {
      return { 
        success: true, 
        checkoutRequestId: data.CheckoutRequestID 
      };
    } else {
      return { 
        success: false, 
        error: data.errorMessage || "STK Push failed" 
        }; 
      }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.errorMessage || error.message 
    };
  }
}