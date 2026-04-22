import { QuotationDetail } from "./client-page"

// This is a Server Component that unwraps the params
export default function QuotationDetailPage({ params }: { params: { id: string } }) {
  const quotationId = params.id
  
  // Pass the unwrapped ID to the Client Component
  return <QuotationDetail id={quotationId} />
}