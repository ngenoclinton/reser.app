// // lib/sms.ts
// import AfricasTalking from "africastalking";

// // Initialize Africa's Talking
// const africastalking = AfricasTalking({
//   apiKey: process.env.AFRICASTALKING_API_KEY,
//   username: process.env.AFRICASTALKING_USERNAME || "sandbox", // use "sandbox" for testing
// });

// const sms = africastalking.SMS;

// export async function sendSMS(to, message, from?) {
//   try {
//     // Clean phone number: ensure it starts with 254
//     const phone = to.replace(/^0/, "254").replace(/[^0-9]/g, "");

//     const result = await sms.send({
//       to: `+${phone}`,
//       message,
//       from: from || process.env.AFRICASTALKING_SHORTCODE,
//     });

//     console.log("SMS sent successfully:", result);
//     return { success: true, data: result };
//   } catch (error) {
//     console.error("SMS Error:", error);
//     return { success: false, error: error.message };
//   }
// }