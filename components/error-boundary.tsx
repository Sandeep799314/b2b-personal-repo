"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"
import { errorHandler } from "@/lib/error-handler"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
  showDetails: boolean
  userFeedback: string
  isReporting: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
      userFeedback: "",
      isReporting: false,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}`,
      showDetails: false,
      userFeedback: "",
      isReporting: false,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = errorHandler.logError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      timestamp: new Date().toISOString(),
    })

    this.setState({ errorId: errorDetails.code })

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      showDetails: false,
      userFeedback: "",
      isReporting: false,
    })
  }

  handleReportError = async () => {
    if (!this.state.errorId) return

    this.setState({ isReporting: true })

    try {
      await errorHandler.reportError(this.state.errorId, this.state.userFeedback)
      this.setState({ userFeedback: "" })
    } catch (reportError) {
      console.error("Failed to report error:", reportError)
    } finally {
      this.setState({ isReporting: false })
    }
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Something went wrong</CardTitle>
              <p className="text-gray-600 mt-2">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                <Button variant="outline" onClick={() => this.setState({ showDetails: !this.state.showDetails })}>
                  {this.state.showDetails ? "Hide Details" : "Show Details"}
                </Button>
              </div>

              {/* Error Details */}
              {this.state.showDetails && (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Error Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Error ID:</strong> {this.state.errorId}
                      </p>
                      <p>
                        <strong>Time:</strong> {new Date().toLocaleString()}
                      </p>
                      <p>
                        <strong>Message:</strong> {this.state.error?.message}
                      </p>
                    </div>
                  </div>

                  {/* Error Reporting */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      Help us improve
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Please describe what you were doing when this error occurred:
                    </p>
                    <Textarea
                      placeholder="I was trying to..."
                      value={this.state.userFeedback}
                      onChange={(e) => this.setState({ userFeedback: e.target.value })}
                      rows={3}
                      className="mb-3"
                    />
                    <Button
                      onClick={this.handleReportError}
                      disabled={this.state.isReporting}
                      size="sm"
                      variant="outline"
                    >
                      {this.state.isReporting ? "Sending..." : "Send Report"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="text-center text-sm text-gray-500 border-t pt-4">
                <p>If this problem persists, please contact our support team with Error ID: {this.state.errorId}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export function useErrorHandler() {
  const handleError = React.useCallback((error: Error | string, context?: Record<string, any>) => {
    errorHandler.handleError(error, context)
  }, [])

  const handleApiError = React.useCallback(
    async (error: any, operation: string, retryCount?: number, maxRetries?: number) => {
      await errorHandler.handleApiError(error, operation, retryCount, maxRetries)
    },
    [],
  )

  const handleValidationErrors = React.useCallback((errors: Record<string, string>) => {
    errorHandler.handleValidationErrors(errors)
  }, [])

  const reportError = React.useCallback(async (errorId: string, description?: string) => {
    await errorHandler.reportError(errorId, description)
  }, [])

  return {
    handleError,
    handleApiError,
    handleValidationErrors,
    reportError,
    errorLog: errorHandler.getErrorLog(),
  }
}
