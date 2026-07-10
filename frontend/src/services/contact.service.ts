export interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  service?: string;
  message: string;
}

export async function submitContactMessage(input: ContactSubmission): Promise<{ success: boolean }> {
  // If we are in local development without a running Vercel server, /api/contact won't exist natively.
  // We point to /api/contact and let Vercel handle it in production.
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  interface ApiErrorResponse {
    error?: string;
  }

  if (!response.ok) {
    let errorMessage = 'Failed to submit proposal/contact message.';
    try {
      const errorData = (await response.json()) as ApiErrorResponse;
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Ignore JSON parse errors if the server returns non-JSON
    }
    throw new Error(errorMessage);
  }

  interface ApiSuccessResponse {
    success: boolean;
  }

  const result = (await response.json()) as ApiSuccessResponse;
  
  if (!result.success) {
    throw new Error('Server reported failure without specific error message.');
  }

  return { success: true };
}
