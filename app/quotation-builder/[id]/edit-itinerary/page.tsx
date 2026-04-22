import { use } from "react"
import { QuotationItineraryEditPage } from "./client-page"

interface PageParams {
  id: string
}

export default function EditQuotationItineraryPage({
  params,
}: {
  params: Promise<PageParams>
}) {
  const resolved = use(params)
  return <QuotationItineraryEditPage quotationId={resolved.id} />
}
