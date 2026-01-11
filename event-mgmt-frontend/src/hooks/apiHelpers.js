

export const getErrorMessage = (error) => {
  // Check if the error has a response from the server (Axios style)
  if (error && error.response && error.response.data) {
    const data = error.response.data;

    // 1. Handle Zod Validation Errors (Status 400)
    // Backend sends: { status: 'fail', message: 'Validation Error', errors: [...] }
    if (data.message === 'Validation Error' && Array.isArray(data.errors)) {
      // Return the first specific validation message (e.g., "Email is invalid")
      return data.errors[0]?.message || 'Invalid input data';
    }

    // 2. Handle Operational Errors (e.g., "Seat taken", "Invalid credentials")
    // Backend sends: { status: 'fail', message: 'Specific error message' }
    if (data.message) {
      return data.message;
    }
  }

  // 3. Fallback for Network Errors (Server down / No Internet)
  return "Something went wrong. Please try again.";
};