"use client"

import { toast } from "@/hooks/use-toast"

export interface ErrorDetails {
  code: string
  message: string
  details?: any
  timestamp: Date
  userId?: string
  context?: Record<string, any>
}

export interface ApiError {
  error: string
  details?: any
  message?: string
  code?: string
  statusCode?: number
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: ErrorDetails[] = []
  private maxLogSize = 100

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  logError(error: Error | ApiError | string, context?: Record<string, any>): ErrorDetails {
    const errorDetails: ErrorDetails = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date(),
      userId: this.getCurrentUserId(),
      context,
    }

    // Add to local log
    this.errorLog.unshift(errorDetails)
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Log to console with structured format
    console.error("[ErrorHandler]", {
      code: errorDetails.code,
      message: errorDetails.message,
      timestamp: errorDetails.timestamp.toISOString(),
      context: errorDetails.context,
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Send to monitoring service (placeholder for real implementation)
    this.sendToMonitoring(errorDetails)

    return errorDetails
  }

  handleError(error: Error | ApiError | string, context?: Record<string, any>): void {
    const errorDetails = this.logError(error, context)
    const userMessage = this.getUserFriendlyMessage(errorDetails)

    toast({
      title: "Error",
      description: userMessage,
      variant: "destructive",
    })
  }

  async handleApiError(error: any, operation: string, retryCount = 0, maxRetries = 3): Promise<void> {
    const errorDetails = this.logError(error, { operation, retryCount })

    // Check if error is retryable
    if (this.isRetryableError(error) && retryCount < maxRetries) {
      const delay = this.getRetryDelay(retryCount)

      toast({
        title: "Connection Issue",
        description: `Retrying ${operation} in ${delay / 1000} seconds... (${retryCount + 1}/${maxRetries})`,
      })

      await new Promise((resolve) => setTimeout(resolve, delay))
      return // Let the caller handle the retry
    }

    // Handle non-retryable or max retries exceeded
    const userMessage = this.getUserFriendlyMessage(errorDetails)

    toast({
      title: "Operation Failed",
      description: userMessage,
      variant: "destructive",
    })
  }

  handleValidationErrors(errors: Record<string, string>): void {
    const errorCount = Object.keys(errors).length
    const firstError = Object.values(errors)[0]

    if (errorCount === 1) {
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Multiple Validation Errors",
        description: `${errorCount} fields need attention. Please check the form for details.`,
        variant: "destructive",
      })
    }

    this.logError(`Validation errors: ${JSON.stringify(errors)}`, {
      type: "validation",
      errorCount,
      fields: Object.keys(errors),
    })
  }

  handleNetworkError(): void {
    const isOnline = navigator.onLine

    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive",
      })
    }

    this.logError("Network error", { isOnline, userAgent: navigator.userAgent })
  }

  async attemptRecovery(operation: () => Promise<any>, fallback?: () => Promise<any>): Promise<any> {
    try {
      return await operation()
    } catch (error) {
      this.logError(error as Error, { type: "recovery_attempt" })

      if (fallback) {
        try {
          toast({
            title: "Attempting Recovery",
            description: "Trying alternative approach...",
          })
          return await fallback()
        } catch (fallbackError) {
          this.logError(fallbackError as Error, { type: "fallback_failed" })
          throw fallbackError
        }
      }

      throw error
    }
  }

  async reportError(errorId: string, userDescription?: string): Promise<void> {
    const error = this.errorLog.find((e) => e.code === errorId)
    if (!error) return

    const report = {
      ...error,
      userDescription,
      reportedAt: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    try {
      // Send error report to backend (placeholder)
      console.log("[ErrorHandler] Error report:", report)

      toast({
        title: "Error Reported",
        description: "Thank you for reporting this issue. Our team will investigate.",
      })
    } catch (reportError) {
      console.error("Failed to send error report:", reportError)
      toast({
        title: "Report Failed",
        description: "Unable to send error report. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Helper methods
  private getErrorCode(error: Error | ApiError | string): string {
    if (typeof error === "string") return "GENERIC_ERROR"
    if ("code" in error && error.code) return error.code
    if (error instanceof Error) return error.name || "UNKNOWN_ERROR"
    return "API_ERROR"
  }

  private getErrorMessage(error: Error | ApiError | string): string {
    if (typeof error === "string") return error
    if ("message" in error && error.message) return error.message
    if ("error" in error && error.error) return error.error
    return "An unknown error occurred"
  }

  private getUserFriendlyMessage(errorDetails: ErrorDetails): string {
    const { code, message } = errorDetails

    // Map technical errors to user-friendly messages
    const errorMap: Record<string, string> = {
      ValidationError: "Please check your input and try again.",
      NetworkError: "Connection problem. Please check your internet and try again.",
      ECONNREFUSED: "Unable to connect to the server. Please try again later.",
      TIMEOUT: "The request took too long. Please try again.",
      UNAUTHORIZED: "You don't have permission to perform this action.",
      FORBIDDEN: "Access denied. Please contact support if this persists.",
      NOT_FOUND: "The requested resource was not found.",
      CONFLICT: "This action conflicts with existing data. Please refresh and try again.",
      RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
      SERVER_ERROR: "Server error. Our team has been notified.",
      GENERIC_ERROR: message.length > 100 ? "An error occurred. Please try again." : message,
    }

    return errorMap[code] || errorMap["GENERIC_ERROR"] || message
  }

  private isRetryableError(error: any): boolean {
    if (typeof error === "string") return false

    const retryableCodes = ["ECONNREFUSED", "TIMEOUT", "NETWORK_ERROR", "SERVER_ERROR"]
    const retryableStatuses = [408, 429, 500, 502, 503, 504]

    if ("code" in error && retryableCodes.includes(error.code)) return true
    if ("statusCode" in error && retryableStatuses.includes(error.statusCode)) return true
    if ("status" in error && retryableStatuses.includes(error.status)) return true

    return false
  }

  private getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return Math.min(1000 * Math.pow(2, retryCount), 10000)
  }

  private getCurrentUserId(): string | undefined {
    // Placeholder for actual user ID retrieval
    return "anonymous"
  }

  private sendToMonitoring(errorDetails: ErrorDetails): void {
    // Placeholder for sending to monitoring service (e.g., Sentry, LogRocket)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "exception", {
        description: errorDetails.message,
        fatal: false,
      })
    }
  }

  // Public methods for accessing error log
  getErrorLog(): ErrorDetails[] {
    return [...this.errorLog]
  }

  clearErrorLog(): void {
    this.errorLog = []
  }

  getErrorById(code: string): ErrorDetails | undefined {
    return this.errorLog.find((error) => error.code === code)
  }
}

export const errorHandler = ErrorHandler.getInstance()
