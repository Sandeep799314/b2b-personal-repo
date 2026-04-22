import { use } from 'react'
import { QuotationDetail } from './client-page'

// This is a Server Component that handles the params
export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // The params are a Promise that needs to be unwrapped using React.use()
  const resolvedParams = use(params)
  const quotationId = resolvedParams.id
  
  // Pass the ID to the Client Component
  return <QuotationDetail id={quotationId} />
}
