"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

interface AdditionalSectionsProps {
  onUpdate: (sections: Record<string, string>) => void
  sections: Record<string, string>
}

const DEFAULT_SECTIONS = [
  { id: 'terms', title: 'Terms & Conditions' },
  { id: 'visas', title: 'Visa Information' },
  { id: 'inclusions', title: 'Package Inclusions' },
  { id: 'exclusions', title: 'Package Exclusions' },
  { id: 'notes', title: 'Important Notes' },
]

export function AdditionalSections({
  onUpdate,
  sections = {}
}: AdditionalSectionsProps) {
  const handleSectionChange = (sectionId: string, value: string) => {
    onUpdate({
      ...sections,
      [sectionId]: value
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Additional Sections</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {DEFAULT_SECTIONS.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>
                <Textarea 
                  value={sections[section.id] || ''}
                  onChange={(e) => handleSectionChange(section.id, e.target.value)}
                  placeholder={`Enter ${section.title.toLowerCase()}...`}
                  className="min-h-[100px]"
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
