// submitTicket.ts
export async function submitTicket(form: {
  name: string;
  email: string;
  subject: string;
  description: string;
  attachment: File | null;
}) {
  // Example: Replace with actual API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simulate error for demonstration
  // throw new Error("Submission failed");
  
  return { success: true };
}