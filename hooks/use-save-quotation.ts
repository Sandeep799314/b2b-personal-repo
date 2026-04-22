// Save quotation version
export const saveQuotationVersion = async (quotationId: string, quotationData?: any) => {
  try {
    const response = await fetch(`/api/quotations/${quotationId}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quotationData || {}),
    });

    if (!response.ok) {
      // Try to get detailed error from response
      let errorMessage = 'Failed to save quotation version';
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          if (errorData.details) {
            errorMessage += ': ' + errorData.details;
          }
        }
      } catch (e) {
        // If response body isn't JSON, use status text
        errorMessage += ` (${response.status}: ${response.statusText})`;
      }
      console.error('Save quotation API error:', errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving quotation version:', error);
    throw error;
  }
};