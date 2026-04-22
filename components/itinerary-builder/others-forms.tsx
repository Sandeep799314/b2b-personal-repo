import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductItem {
  name: string
  price: number | ""
  description: string
  currency?: string
}

interface OthersFormsProps {
  selectedSubCategory: string
  // Common
  manualTitle: string
  setManualTitle: (v: string) => void
  manualDescription?: string // Added
  setManualDescription?: (v: string) => void // Added
  manualPrice?: number | "" // Added
  setManualPrice?: (v: number | "") => void // Added
  manualCurrency: string
  setManualCurrency: (v: string) => void
  manualImageUrl?: string // Added
  setManualImageUrl?: (v: string) => void // Added
  // Gift card specific
  manualGiftAmount?: number | "" // Optional
  setManualGiftAmount?: (v: number | "") => void // Optional
  manualServiceCharge?: number | "" // Optional
  setManualServiceCharge?: (v: number | "") => void // Optional
  // Travel gears specific
  manualProducts?: ProductItem[] // Optional
  handleAddProduct?: () => void // Optional
  handleRemoveProduct?: (index: number) => void // Optional
  handleProductChange?: (index: number, field: keyof ProductItem, value: any) => void // Optional
  errors?: Record<string, string>
}

export function OthersForms(props: OthersFormsProps) {
  const {
    selectedSubCategory,
    manualTitle,
    setManualTitle,
    manualDescription,
    setManualDescription,
    manualPrice,
    setManualPrice,
    manualCurrency,
    setManualCurrency,
    manualImageUrl,
    setManualImageUrl,
    manualGiftAmount,
    setManualGiftAmount,
    manualServiceCharge,
    setManualServiceCharge,
    manualProducts = [],
    handleAddProduct,
    handleRemoveProduct,
    handleProductChange,
    errors = {},
  } = props

  // Generic Form (Fallthrough or specific check)
  const isGeneric = !["gift-cards", "travel-gears"].includes(selectedSubCategory)

  return (
    <>
      {isGeneric && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Item Title (e.g. Cruise Name)"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={manualDescription || ""}
              onChange={(e) => setManualDescription?.(e.target.value)}
              placeholder="Description"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Price</label>
            <div className="flex gap-2">
              <Select value={manualCurrency} onValueChange={setManualCurrency}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                className={`flex-1 ${errors.price ? "border-red-500" : ""}`}
                value={manualPrice || ""}
                onChange={(e) => setManualPrice?.(Number(e.target.value) || "")}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Image URL</label>
            <Input
              value={manualImageUrl || ""}
              onChange={(e) => setManualImageUrl?.(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      )}

      {selectedSubCategory === "gift-cards" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Gift card title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Amount</label>
            <div className="flex gap-2">
              <Select value={manualCurrency} onValueChange={setManualCurrency}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                className={`flex-1 ${errors.price ? "border-red-500" : ""}`}
                value={manualGiftAmount || ""}
                onChange={(e) => setManualGiftAmount?.(Number(e.target.value) || "")}
                placeholder="0.00"
              />
            </div>
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Service Charge</label>
            <div className="flex gap-2">
              <div className="w-[100px] flex items-center justify-center bg-gray-50 border rounded-md text-sm text-gray-500">
                {manualCurrency}
              </div>
              <Input type="number" className="flex-1" value={manualServiceCharge || ""} onChange={(e) => setManualServiceCharge?.(Number(e.target.value) || "")} placeholder="0.00" />
            </div>
          </div>
        </div>
      )}

      {selectedSubCategory === "travel-gears" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Travel gear title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Currency (Default)</label>
            <Select value={manualCurrency} onValueChange={setManualCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Products (multiple)</label>
            <div className="space-y-3">
              {manualProducts.map((p, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Product {idx + 1}</span>
                    {manualProducts.length > 1 && handleRemoveProduct && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveProduct(idx)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input value={p.name} onChange={(e) => handleProductChange?.(idx, 'name', e.target.value)} placeholder="Product name" />
                    <div className="flex gap-2">
                      <Select
                        value={p.currency || manualCurrency}
                        onValueChange={(val) => handleProductChange?.(idx, 'currency', val)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="AED">AED</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" className="flex-1" value={p.price} onChange={(e) => handleProductChange?.(idx, 'price', Number(e.target.value) || "")} placeholder="Price" />
                    </div>
                    <Textarea value={p.description} onChange={(e) => handleProductChange?.(idx, 'description', e.target.value)} placeholder="Description" rows={2} />
                  </div>
                </div>
              ))}

              {handleAddProduct && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddProduct}>
                  + Add Product
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
