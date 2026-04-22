"use client"

import { useState } from "react"
import { Users, Minus, Plus, ShoppingCart, CreditCard, Mail, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function PricingPanel() {
  const [rooms, setRooms] = useState([{ adults: 2, children: 1, childAges: [8] }])

  const addRoom = () => {
    setRooms([...rooms, { adults: 1, children: 0, childAges: [] }])
  }

  const updateRoom = (index: number, field: string, value: number) => {
    const newRooms = [...rooms]
    if (field === "children") {
      newRooms[index].childAges = Array(value).fill(0)
    }
    newRooms[index] = { ...newRooms[index], [field]: value }
    setRooms(newRooms)
  }

  const pricePerAdult = 899
  const pricePerChild = 599
  const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0)
  const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0)
  const subtotal = totalAdults * pricePerAdult + totalChildren * pricePerChild
  const taxes = subtotal * 0.1
  const discount = subtotal * 0.05 // 5% discount
  const total = subtotal + taxes - discount

  return (
    <div className="w-80 bg-white border-l border-neutral-200 shadow-brand-sm overflow-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center pb-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Configure & Price</h3>
          <p className="text-body-sm text-neutral-600 mt-1">Set up travelers and pricing</p>
        </div>

        {/* Guest Configuration */}
        <Card className="card-flat">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base font-semibold">
              <Users className="mr-2 h-5 w-5 text-brand-primary-500" />
              Guest Configuration
            </CardTitle>
            <CardDescription className="text-body-sm">Configure rooms and travelers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {rooms.map((room, index) => (
              <div key={index} className="p-4 border border-neutral-200 rounded-lg space-y-4 bg-neutral-50">
                <div className="flex justify-between items-center">
                  <span className="text-label-md text-neutral-900">Room {index + 1}</span>
                  {rooms.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRooms(rooms.filter((_, i) => i !== index))}
                      className="text-error-600 hover:text-error-700 hover:bg-error-50 text-xs"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-neutral-700">Adults</span>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoom(index, "adults", Math.max(1, room.adults - 1))}
                        className="h-8 w-8 p-0 border-neutral-300 hover:border-brand-primary-300 hover:bg-brand-primary-50"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-label-md text-neutral-900">{room.adults}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoom(index, "adults", room.adults + 1)}
                        className="h-8 w-8 p-0 border-neutral-300 hover:border-brand-primary-300 hover:bg-brand-primary-50"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-neutral-700">Children</span>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoom(index, "children", Math.max(0, room.children - 1))}
                        className="h-8 w-8 p-0 border-neutral-300 hover:border-brand-primary-300 hover:bg-brand-primary-50"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-label-md text-neutral-900">{room.children}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateRoom(index, "children", room.children + 1)}
                        className="h-8 w-8 p-0 border-neutral-300 hover:border-brand-primary-300 hover:bg-brand-primary-50"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {room.children > 0 && (
                    <div className="pt-2 border-t border-neutral-200">
                      <p className="text-body-xs text-neutral-600 mb-2">Child ages:</p>
                      <div className="flex flex-wrap gap-2">
                        {room.childAges.map((age, i) => (
                          <select
                            key={i}
                            value={age}
                            onChange={(e) => {
                              const newAges = [...room.childAges]
                              newAges[i] = Number.parseInt(e.target.value)
                              const newRooms = [...rooms]
                              newRooms[index].childAges = newAges
                              setRooms(newRooms)
                            }}
                            className="input-field text-xs w-16 h-8"
                          >
                            {Array.from({ length: 18 }, (_, i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addRoom} className="w-full btn-outline bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </CardContent>
        </Card>

        {/* Price Summary */}
        <Card className="card-flat">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base font-semibold">
              <Calculator className="mr-2 h-5 w-5 text-brand-secondary-500" />
              Price Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-neutral-700">Adults ({totalAdults})</span>
                <span className="text-body-sm text-neutral-900 font-medium">
                  ₹{pricePerAdult} × {totalAdults}
                </span>
              </div>
              {totalChildren > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-body-sm text-neutral-700">Children ({totalChildren})</span>
                  <span className="text-body-sm text-neutral-900 font-medium">
                    ₹{pricePerChild} × {totalChildren}
                  </span>
                </div>
              )}
            </div>

            <Separator className="bg-neutral-200" />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-body-sm text-neutral-700">Subtotal</span>
                <span className="text-body-sm text-neutral-900 font-medium">₹{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-xs text-neutral-600">Taxes & Fees</span>
                <span className="text-body-xs text-neutral-600">₹{taxes.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-xs text-success-600">Early Bird Discount</span>
                <span className="text-body-xs text-success-600">-₹{discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <Separator className="bg-neutral-200" />

            <div className="flex justify-between items-center py-2">
              <span className="text-heading-md text-neutral-900">Total</span>
              <span className="text-heading-lg text-gray-900 font-bold">₹{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 text-label-lg rounded transition-colors">
            BOOK NOW
          </Button>

          <div className="text-center text-xs text-gray-500">OR</div>

          <Button variant="outline" className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 h-12 text-label-lg bg-transparent rounded transition-colors">
            Add to Cart
          </Button>

          <div className="text-center text-xs text-gray-500">OR</div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="input-field text-sm h-10"
              />
              <input
                type="email"
                placeholder="Email"
                className="input-field text-sm h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="+91 Mobile"
                className="input-field text-sm h-10"
              />
              <select className="input-field text-sm h-10">
                <option>Travel Count</option>
                <option>1</option>
                <option>2</option>
                <option>3+</option>
              </select>
            </div>
          </div>

          <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 text-label-lg rounded transition-colors">
            SEND ENQUIRY
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="pt-4 border-t border-neutral-200">
          <div className="text-center space-y-2">
            <p className="text-body-xs text-neutral-500">🔒 Secure payment processing</p>
            <p className="text-body-xs text-neutral-500">✈️ IATA certified travel agent</p>
            <p className="text-body-xs text-neutral-500">📞 24/7 customer support</p>
          </div>
        </div>
      </div>
    </div>
  )
}
