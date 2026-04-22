import { IQuotation } from "../models/Quotation";

/**
 * Utility function to recalculate quotation pricing based on current values
 * This is a flexible version that works with both server-side IQuotation and client-side QuotationData
 * @param quotation The quotation object to recalculate
 * @returns The quotation with updated pricing
 */
export function recalculateQuotationTotals(quotation: any): any {
  if (!quotation || !quotation.pricingOptions) return quotation;

  // Start with the original subtotal
  const subtotal = typeof quotation.subtotal === 'number' ? 
    quotation.subtotal : 
    (quotation.pricingOptions.originalTotalPrice || 0);

  // Calculate markup based on type
  let markup = 0;
  if (quotation.pricingOptions.markupType === "percentage" && quotation.pricingOptions.markupValue) {
    markup = subtotal * (quotation.pricingOptions.markupValue / 100);
  } else if (quotation.pricingOptions.markupType === "fixed" && quotation.pricingOptions.markupValue) {
    markup = quotation.pricingOptions.markupValue;
  }

  // Calculate final total
  const total = subtotal + markup;

  // Return updated quotation with all pricing fields
  return {
    ...quotation,
    subtotal,
    markup,
    total,
    pricingOptions: {
      ...quotation.pricingOptions,
      originalTotalPrice: subtotal,
      finalTotalPrice: total // For backward compatibility
    },
    totalPrice: total // For backward compatibility
  };
}