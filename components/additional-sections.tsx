"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface AdditionalSectionsProps {
  sections: Record<string, string>
  onUpdate: (sections: Record<string, string>) => void
  className?: string
}
//niket
export function AdditionalSections({ sections, onUpdate, className }: AdditionalSectionsProps) {
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Terms and Conditions</h3>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Rates are subject to change without prior notice</li>
              <li>Standard check-in time is 2:00 PM and check-out time is 12:00 PM</li>
              <li>Bookings are subject to availability</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Visa Requirements</h3>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Valid passport with minimum 6 months validity</li>
              <li>Tourist visa required for international travel</li>
              <li>Visa processing time: 5-7 working days</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Important Notes</h3>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Travel insurance is recommended</li>
              <li>All activities are subject to weather conditions</li>
              <li>Please inform about any dietary restrictions in advance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
