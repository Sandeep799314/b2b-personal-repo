"use client"

import { createRoot } from "react-dom/client"
import { PrintableItinerary } from "./printable-itinerary"
import { QuotationPricingOptions } from "@/models/Quotation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MapPin, Download, Share2, Save, ChevronDown, FileText, FileImage } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface ItineraryHeaderProps {
  title: string
  description: string
  days: number
  nights: number
  country: string
  highlights: string[]
  onSave: () => void
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onHighlightsChange: (value: string[]) => void
  onCountryChange: (value: string) => void
  onDaysChange: (value: number) => void
  onNightsChange: (value: number) => void
  version: number
  hasBeenSaved: boolean
  isDetailedView: boolean
  onViewChange: (value: boolean) => void

  itineraryData?: any // This should match your itinerary data structure
  mode?: "itinerary" | "quotation"
  pricingOptions?: QuotationPricingOptions
}

const HIGHLIGHT_OPTIONS = [
  "Daily Breakfast",
  "Cab",
  "Travel Insurance",
  "Sightseeing",
  "Hotel",
  "Visa",
  "Wildlife",
  "Beach",
  "Nature",
  "Hill Station",
  "Water Activities"
]

export function ItineraryHeader({
  title,
  description,
  days,
  nights,
  country,
  highlights,
  onSave,
  onTitleChange,
  onDescriptionChange,
  onHighlightsChange,
  onCountryChange,
  onDaysChange,
  onNightsChange,
  version,
  hasBeenSaved,
  isDetailedView,
  onViewChange,

  itineraryData,
  mode = "itinerary",
  pricingOptions
}: ItineraryHeaderProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleSave = () => {
    setShowSaveDialog(true)
  }

  const confirmSave = () => {
    onSave()
    setShowSaveDialog(false)
  }

  const toggleHighlight = (highlight: string) => {
    if (highlights.includes(highlight)) {
      onHighlightsChange(highlights.filter(h => h !== highlight))
    } else {
      onHighlightsChange([...highlights, highlight])
    }
  }

  return (
    <div className="space-y-4 mb-8 itinerary-container">
      {/* Save and Share Buttons - Top Right */}
      <div className="flex items-center justify-end gap-2">
        {hasBeenSaved && (
          <>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  // Create a container for the full itinerary
                  const container = document.createElement('div');
                  container.style.background = 'white';
                  container.style.padding = '40px';
                  container.style.width = '210mm'; // A4 width
                  container.style.position = 'fixed';
                  container.style.left = '-9999px';
                  document.body.appendChild(container);

                  // Create a new root and render content
                  const root = createRoot(container);

                  // Render all content
                  const content = (
                    <div className="pdf-container" style={{ fontFamily: 'sans-serif' }}>
                      {/* Header Section */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '24px', marginBottom: '1rem' }}>{title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <MapPin style={{ width: '16px', height: '16px', color: '#666' }} />
                          <span>{country}</span>
                        </div>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          backgroundColor: '#E8F3FF',
                          color: '#2D7CEA',
                          borderRadius: '4px',
                          border: '1px solid #2D7CEA',
                          fontSize: '14px'
                        }}>
                          {days} Days • {nights} Nights
                        </div>
                      </div>

                      {/* Description */}
                      {description && (
                        <div style={{ marginBottom: '2rem' }}>
                          <p style={{ color: '#666' }}>{description}</p>
                        </div>
                      )}

                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {highlights.map((highlight, idx) => (
                              <span key={idx} style={{
                                padding: '4px 12px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}>
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Itinerary Days */}
                      {itineraryData?.days?.map((day, dayIndex) => (
                        <div key={dayIndex} style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
                          <h2 style={{
                            fontSize: '18px',
                            marginBottom: '1rem',
                            backgroundColor: '#E8F3FF',
                            padding: '8px 16px',
                            borderRadius: '4px'
                          }}>
                            Day {dayIndex + 1}
                          </h2>

                          {/* Day Events */}
                          {day.events?.map((event, eventIndex) => (
                            <div key={eventIndex} style={{
                              marginBottom: '1rem',
                              padding: '16px',
                              border: '1px solid #eee',
                              borderRadius: '8px'
                            }}>
                              <h3 style={{ fontSize: '16px', marginBottom: '0.5rem' }}>{event.title}</h3>
                              <p style={{ color: '#666', marginBottom: '0.5rem' }}>{event.description}</p>
                              {event.time && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                                  <Clock style={{ width: '14px', height: '14px' }} />
                                  <span>{event.time}</span>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Day Meals */}
                          {day.meals && (
                            <div style={{
                              marginTop: '1rem',
                              padding: '12px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px'
                            }}>
                              <h4 style={{ fontSize: '14px', marginBottom: '0.5rem' }}>Meals Included:</h4>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                {day.meals.breakfast && <span>Breakfast</span>}
                                {day.meals.lunch && <span>Lunch</span>}
                                {day.meals.dinner && <span>Dinner</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Additional Sections if any */}
                      {itineraryData?.additionalSections?.map((section, index) => (
                        <div key={index} style={{ marginBottom: '2rem', pageBreakInside: 'avoid' }}>
                          <h2 style={{ fontSize: '18px', marginBottom: '1rem' }}>{section.title}</h2>
                          <div>{section.content}</div>
                        </div>
                      ))}
                    </div>
                  );

                  root.render(content);

                  // Wait for content to be rendered
                  await new Promise(resolve => setTimeout(resolve, 1000));

                  // Generate PDF
                  const pdfElement = container.firstChild as HTMLElement;
                  const canvas = await html2canvas(pdfElement, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                  });

                  // Clean up
                  root.unmount();
                  document.body.removeChild(container);

                  // Create PDF with proper dimensions
                  const imgWidth = 210; // A4 width in mm
                  const pageHeight = 297; // A4 height in mm
                  const imgHeight = canvas.height * imgWidth / canvas.width;

                  const pdf = new jsPDF('p', 'mm', 'a4');
                  let position = 0;
                  let remainingHeight = imgHeight;

                  while (remainingHeight > 0) {
                    // Add page content
                    pdf.addImage(
                      canvas.toDataURL('image/png'),
                      'PNG',
                      0,
                      position,
                      imgWidth,
                      imgHeight,
                      '',
                      'FAST'
                    );

                    remainingHeight -= pageHeight;
                    if (remainingHeight > 0) {
                      pdf.addPage();
                      position -= pageHeight;
                    }
                  }

                  // Save the PDF
                  pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-itinerary.pdf`);

                } catch (error) {
                  console.error('Error generating PDF:', error);
                }
              }}>
              <Download className="h-4 w-4 mr-2" />
              Download Itinerary
            </Button>
          </>
        )}
        <Button onClick={handleSave} variant="default" size="sm" className="bg-[#2D7CEA]">
          <Save className="h-4 w-4 mr-2" />
          Save {version > 0 ? `v${version + 1}` : ''}
        </Button>
      </div>

      {/* Itinerary Title - Biggest Font Size */}
      <div className="space-y-1">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="South of Thailand - Krabi, Phuket"
          className="text-4xl font-bold h-auto border-none p-0"
          style={{ fontWeight: 700, lineHeight: '1.2' }}
          aria-label="Itinerary title"
        />
      </div>

      {/* Days and Nights */}
      <div className="flex items-center gap-2">
        <div className="bg-[#E8F3FF] text-[#2D7CEA] border-[#2D7CEA] border rounded-md flex items-center px-3 py-2 text-lg font-semibold select-none">
          {days} Days &nbsp;•&nbsp; {days > 0 ? days - 1 : 0} Nights
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter itinerary description..."
          className="min-h-[80px] border-none resize-none p-0 text-base"
          aria-label="Itinerary description"
        />
      </div>

      {/* Destination */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <Input
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder="Enter destination..."
            className="border-none p-0 text-base font-semibold"
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2" aria-label="Highlights">
          {HIGHLIGHT_OPTIONS.map((highlight) => (
            <Badge
              key={highlight}
              variant="outline"
              className={`cursor-pointer ${highlights.includes(highlight)
                ? 'bg-[#2D7CEA] text-white'
                : 'bg-white text-gray-600'
                }`}
              onClick={() => toggleHighlight(highlight)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleHighlight(highlight)
                }
              }}
            >
              {highlight}
            </Badge>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between border-t border-b py-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={isDetailedView}
            onCheckedChange={onViewChange}
          />
          <span className="text-sm font-medium">
            {isDetailedView ? 'Detailed' : 'Summarised'} View
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Modify
          </Button>
          <Button variant="outline" size="sm">
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Download
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {
                // Create a new window for printing
                const printWindow = window.open('', '_blank');
                if (!printWindow) return;

                // Add necessary styles
                const styleSheet = printWindow.document.createElement('style');
                styleSheet.textContent = `
                  @media print {
                    @page { margin: 0; }
                    body { margin: 0; }
                  }
                  body { 
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background-color: white;
                    padding: 2rem;
                  }
                `;
                printWindow.document.head.appendChild(styleSheet);

                // Add the Tailwind CDN for styling
                const tailwindScript = printWindow.document.createElement('script');
                tailwindScript.src = 'https://cdn.tailwindcss.com';
                printWindow.document.head.appendChild(tailwindScript);

                // Create a container for our printable content
                const container = printWindow.document.createElement('div');
                printWindow.document.body.appendChild(container);

                // Render the printable version
                const root = createRoot(container);
                root.render(
                  <PrintableItinerary
                    title={title}
                    description={description}
                    days={days}
                    nights={nights}
                    country={country}
                    highlights={highlights}
                    version={version}
                    itineraryData={itineraryData}
                    additionalSections={itineraryData.additionalSections}
                    mode={mode}
                    pricingOptions={pricingOptions}
                  />
                );

                // Print after styles are loaded
                tailwindScript.onload = () => {
                  setTimeout(() => {
                    printWindow.print();
                    // Close the window after printing
                    printWindow.onafterprint = () => {
                      printWindow.close();
                    };
                  }, 1000);
                };
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Print / Save as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                const jsonString = JSON.stringify({
                  title,
                  description,
                  country,
                  days,
                  nights,
                  highlights,
                  version,
                  ...itineraryData
                }, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-v${version}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}>
                <FileImage className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Save Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Itinerary</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save this itinerary? This will create version {version + 1}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}