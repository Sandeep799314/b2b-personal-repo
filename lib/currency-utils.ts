/**
 * Utility functions for currency conversion in quotations
 */

/**
 * Convert an amount from one currency to another using exchange rates
 * 
 * @param amount The amount to convert
 * @param fromCurrency The currency to convert from
 * @param toCurrency The currency to convert to
 * @param exchangeRates Object with exchange rates relative to baseCurrency
 * @param baseCurrency The base currency for exchange rates (usually USD)
 * @returns The converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: Record<string, number>,
  baseCurrency: string = "USD"
): number {
  // If the currencies are the same, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // If exchange rates aren't available, return original amount
  if (!exchangeRates) {
    console.warn("Exchange rates not available for conversion");
    return amount;
  }

  // Get exchange rates or default to 1 if not found
  const fromRate = fromCurrency === baseCurrency ? 1 : exchangeRates[fromCurrency] || 1;
  const toRate = toCurrency === baseCurrency ? 1 : exchangeRates[toCurrency] || 1;

  // If fromCurrency is baseCurrency, we can directly multiply by toRate
  if (fromCurrency === baseCurrency) {
    return amount * toRate;
  }

  // If toCurrency is baseCurrency, we can directly divide by fromRate
  if (toCurrency === baseCurrency) {
    return amount / fromRate;
  }

  // Otherwise, convert to baseCurrency first, then to target currency
  const amountInBaseCurrency = amount / fromRate;
  return amountInBaseCurrency * toRate;
}

/**
 * Format a currency amount with the appropriate symbol
 * Uses international number format with commas and 2 decimal places
 * 
 * @param amount The amount to format
 * @param currency The currency code (USD, EUR, INR, etc.)
 * @returns Formatted currency string (e.g., ₹1,234,567.89)
 */
export function formatCurrencyWithSymbol(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    INR: "₹",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    SGD: "S$",
    AED: "د.إ",
    // Add more currencies as needed
  };

  const symbol = symbols[currency] || currency;

  // Format with international commas and exactly 2 decimal places
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  return `${symbol}${formattedNumber}`;
}

/**
 * Get currency symbol for a given currency code
 * 
 * @param currency The currency code (USD, EUR, INR, etc.)
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    INR: "₹",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    SGD: "S$",
    AED: "د.إ",
    // Add more currencies as needed
  };

  return symbols[currency] || currency;
}

/**
 * Convert all price-related fields in a quotation to a different currency
 * 
 * @param quotation The quotation object
 * @param toCurrency The target currency to display
 * @returns New quotation with converted prices (doesn't modify original)
 */
export function convertQuotationPrices(quotation: any, toCurrency: string): any {
  if (!quotation || !quotation.currencySettings) {
    return quotation;
  }

  const { baseCurrency, exchangeRates } = quotation.currencySettings;

  // If the target currency is the same as base currency, no conversion needed
  if (baseCurrency === toCurrency) {
    return {
      ...quotation,
      currencySettings: {
        ...quotation.currencySettings,
        displayCurrency: toCurrency
      }
    };
  }

  // Create a deep copy of the quotation
  const converted = JSON.parse(JSON.stringify(quotation));

  // Set the display currency
  converted.currencySettings.displayCurrency = toCurrency;

  // Convert top-level price fields
  if (converted.subtotal !== undefined) {
    converted.displaySubtotal = convertCurrency(
      converted.subtotal,
      baseCurrency,
      toCurrency,
      exchangeRates,
      baseCurrency
    );
  }

  if (converted.markup !== undefined) {
    converted.displayMarkup = convertCurrency(
      converted.markup,
      baseCurrency,
      toCurrency,
      exchangeRates,
      baseCurrency
    );
  }

  if (converted.total !== undefined) {
    converted.displayTotal = convertCurrency(
      converted.total,
      baseCurrency,
      toCurrency,
      exchangeRates,
      baseCurrency
    );
  }

  // Convert pricing options
  if (converted.pricingOptions) {
    if (converted.pricingOptions.originalTotalPrice !== undefined) {
      converted.pricingOptions.displayOriginalTotalPrice = convertCurrency(
        converted.pricingOptions.originalTotalPrice,
        baseCurrency,
        toCurrency,
        exchangeRates,
        baseCurrency
      );
    }

    if (converted.pricingOptions.finalTotalPrice !== undefined) {
      converted.pricingOptions.displayFinalTotalPrice = convertCurrency(
        converted.pricingOptions.finalTotalPrice,
        baseCurrency,
        toCurrency,
        exchangeRates,
        baseCurrency
      );
    }

    // If using fixed markup, convert the markup value
    if (converted.pricingOptions.markupType === "fixed" && converted.pricingOptions.markupValue !== undefined) {
      converted.pricingOptions.displayMarkupValue = convertCurrency(
        converted.pricingOptions.markupValue,
        baseCurrency,
        toCurrency,
        exchangeRates,
        baseCurrency
      );
    }
  }

  // Convert event prices if they exist
  if (converted.days && Array.isArray(converted.days)) {
    converted.days.forEach((day: any) => {
      if (day.events && Array.isArray(day.events)) {
        day.events.forEach((event: any) => {
          if (event.price !== undefined) {
            event.displayPrice = convertCurrency(
              event.price,
              baseCurrency,
              toCurrency,
              exchangeRates,
              baseCurrency
            );
          }
        });
      }
    });
  }

  return converted;
}