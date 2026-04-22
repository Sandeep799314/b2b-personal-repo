"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useQuotations, QuotationData } from '@/hooks/use-quotations'
import { useToast } from '@/hooks/use-toast'

export default function QuotationDebugPage() {
  const [quotations, setQuotations] = useState<QuotationData[]>([])
  const [loading, setLoading] = useState(true)
  const { fetchQuotations } = useQuotations()
  const { toast } = useToast()

  useEffect(() => {
    async function loadQuotations() {
      try {
        setLoading(true)
        const data = await fetchQuotations()
        if (data) {
          setQuotations(data)
        }
      } catch (error) {
        console.error('Error loading quotations:', error)
        toast({
          title: 'Error',
          description: 'Failed to load quotations',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadQuotations()
  }, [fetchQuotations, toast])

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/quotation-builder">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotations
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Debug Quotations</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Available Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : quotations.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No quotations found</p>
          ) : (
            <div className="space-y-4">
              {quotations.map((quotation) => (
                <div key={quotation._id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{quotation.title}</h3>
                      <p className="text-sm text-muted-foreground">ID: {quotation._id}</p>
                    </div>
                    <Link href={`/quotation-builder/${quotation._id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Destination:</span> {quotation.destination}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Client:</span> {quotation.client?.name || 'N/A'}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span> {quotation.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}