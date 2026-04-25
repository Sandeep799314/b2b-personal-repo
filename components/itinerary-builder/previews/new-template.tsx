import { useState } from "react";
import { calculateTotalPrice, PricingConfig, calculateComponentPrice } from "@/lib/pricing-calculator";

interface NewTemplateProps {
  itinerary: any
  showPrices: boolean
  showItemizedPrices?: boolean
  isDetailed?: boolean
  currency: string
  exchangeRates: Record<string, number>
}

export default function NewTemplate({ 
  itinerary, 
  showPrices, 
  showItemizedPrices = true, 
  isDetailed = true, 
  currency, 
  exchangeRates 
}: NewTemplateProps) {
  // Debug log to check incoming data
  console.log("[NewTemplate] Rendering with itinerary:", itinerary);

  // Use the currency passed from the universal header
  const displayCurrency = currency || "INR";
  
  const previewConfig = itinerary.previewConfig || {}
  const days = itinerary.days || []
  
  const adults = previewConfig.adults || 1
  const children = previewConfig.children || 0
  const totalPax = adults + children

  // ... (pricingConfig and calculation remain the same)
  const pricingConfig: PricingConfig = {
    adults,
    children,
    targetCurrency: displayCurrency,
    exchangeRates,
    baseCurrency: 'INR'
  }

  // Calculate total price
  const allEvents = days.flatMap((day: any) => day.events || [])
  const { total: basePrice } = calculateTotalPrice(allEvents, pricingConfig)
  
  // Markup calculation
  let markupAmount = 0
  if (itinerary.markupType === "percentage") {
      markupAmount = basePrice * (itinerary.markupValue || 0) / 100
  } else if (itinerary.markupType === "amount" && itinerary.markupValue) {
      markupAmount = itinerary.markupValue
  }
  
  const finalTotal = basePrice + markupAmount
  const displayTotal = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: displayCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
  }).format(finalTotal)

  // Date helpers
  const getStartDate = () => {
    if (previewConfig.withDates && previewConfig.startDate) {
        return new Date(previewConfig.startDate)
    }
    return null
  }
  const startDate = getStartDate()
  const endDate = startDate ? new Date(new Date(startDate).getTime() + (Math.max(0, days.length - 1)) * 24 * 60 * 60 * 1000) : null

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatDateRange = (start: Date, end: Date) => {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`
  }

  // Helper to get image from event
  const getEventImage = (event: any) => {
    return event.image || event.imageUrl || (event.images && event.images.length > 0 ? event.images[0] : null);
  };

  // Helper to get meta items for different categories
  const getEventMeta = (event: any) => {
    const meta: { k: string, v: string }[] = [];

    switch (event.category) {
      case 'flight':
        if (event.airlines) meta.push({ k: "AIRLINE", v: event.airlines });
        if (event.flightNumber) meta.push({ k: "FLIGHT NO", v: event.flightNumber });
        if (event.flightClass) meta.push({ k: "CLASS", v: event.flightClass });
        if (event.numberOfStops !== undefined) {
          const stopsDisplay = event.numberOfStops === 0 ? "Non-stop" : `${event.numberOfStops} Stop(s)${event.stopLocations?.length ? ' via ' + event.stopLocations.join(', ') : ''}`;
          meta.push({ k: "STOPS", v: stopsDisplay });
        }
        if (event.fromCity && event.toCity) meta.push({ k: "ROUTE", v: `${event.fromCity} → ${event.toCity}` });
        if (event.startTime || event.endTime) meta.push({ k: "TIME", v: `${event.startTime || '--:--'} - ${event.endTime || '--:--'}` });
        if (event.duration) meta.push({ k: "DURATION", v: event.duration });
        if (event.baggage) meta.push({ k: "BAGGAGE", v: event.baggage });
        if (event.checkinBags || event.checkinBagWeight) meta.push({ k: "CHECK-IN BAG", v: `${event.checkinBags || '1'} (${event.checkinBagWeight || '23kg'})` });
        if (event.cabinBags || event.cabinBagWeight) meta.push({ k: "CABIN BAG", v: `${event.cabinBags || '1'} (${event.cabinBagWeight || '7kg'})` });
        if (event.pnr) meta.push({ k: "PNR", v: event.pnr });
        if (event.bookingId) meta.push({ k: "BOOKING ID", v: event.bookingId });
        if (event.seatNumber) meta.push({ k: "SEAT", v: event.seatNumber });
        if (event.inFlightMeals) meta.push({ k: "MEALS", v: event.inFlightMeals });
        if (event.refundable) meta.push({ k: "POLICY", v: event.refundable });
        break;
      case 'hotel':
        if (event.roomCategory) meta.push({ k: "ROOM", v: event.roomCategory });
        if (event.nights) meta.push({ k: "NIGHTS", v: event.nights.toString() });
        if (event.checkIn) meta.push({ k: "CHECK-IN", v: event.checkIn });
        if (event.checkOut) meta.push({ k: "CHECK-OUT", v: event.checkOut });
        if (event.hotelRating) meta.push({ k: "RATING", v: `${event.hotelRating} ★` });
        if (event.location) meta.push({ k: "LOCATION", v: event.location });
        if (event.mealPlan) meta.push({ k: "MEAL PLAN", v: event.mealPlan });
        if (event.propertyType) meta.push({ k: "TYPE", v: event.propertyType });
        if (event.address) meta.push({ k: "ADDRESS", v: event.address });
        if (event.confirmationNumber) meta.push({ k: "CONFIRMATION", v: event.confirmationNumber });
        if (event.refundable) meta.push({ k: "POLICY", v: event.refundable });
        break;
      case 'activity':
        if (event.duration) meta.push({ k: "DURATION", v: event.duration });
        if (event.language) meta.push({ k: "GUIDE", v: event.language });
        if (event.groupSize || event.capacity) meta.push({ k: "GROUP", v: (event.groupSize || event.capacity).toString() });
        if (event.pickupLocation) meta.push({ k: "PICKUP", v: event.pickupLocation });
        if (event.startTime) meta.push({ k: "TIME", v: event.startTime });
        if (event.difficulty) meta.push({ k: "DIFFICULTY", v: event.difficulty });
        break;
      case 'meal':
        if (event.cuisine) meta.push({ k: "CUISINE", v: event.cuisine });
        if (event.startTime) meta.push({ k: "TIME", v: event.startTime });
        if (event.dressCode) meta.push({ k: "DRESS", v: event.dressCode });
        if (event.paxCount) meta.push({ k: "SEATS", v: event.paxCount.toString() });
        if (event.meals && event.meals.length > 0) meta.push({ k: "MEAL TYPE", v: event.meals.join(", ") });
        break;
      case 'transfer':
        if (event.fromLocation || event.fromCity || event.toLocation || event.toCity) {
          meta.push({ k: "ROUTE", v: `${event.fromLocation || event.fromCity || "..."} → ${event.toLocation || event.toCity || "..."}` });
        }
        if (event.vehicleType) meta.push({ k: "VEHICLE", v: event.vehicleType });
        if (event.transferType) meta.push({ k: "TYPE", v: event.transferType });
        if (event.transferCategory) meta.push({ k: "CATEGORY", v: event.transferCategory });
        if (event.pickupDrop) meta.push({ k: "MODE", v: event.pickupDrop.toUpperCase() });
        if (event.airportName) meta.push({ k: "AIRPORT", v: event.airportName });
        if (event.pickupTime || (event as any).departureTime) meta.push({ k: "PICKUP", v: event.pickupTime || (event as any).departureTime });
        if (event.dropTime || (event as any).arrivalTime) meta.push({ k: "DROP", v: event.dropTime || (event as any).arrivalTime });
        if (event.noOfHours) meta.push({ k: "HOURS", v: event.noOfHours.toString() });
        if (event.noOfDays) meta.push({ k: "DAYS", v: event.noOfDays.toString() });
        if (event.carModel) meta.push({ k: "CAR MODEL", v: event.carModel });
        if (event.fuelType) meta.push({ k: "FUEL", v: event.fuelType });
        if (event.transmission) meta.push({ k: "TRANS", v: event.transmission });
        if (event.busNumber) meta.push({ k: "BUS NO", v: event.busNumber });
        if (event.trainNumber) meta.push({ k: "TRAIN NO", v: event.trainNumber });
        if (event.pnr) meta.push({ k: "PNR", v: event.pnr });
        break;
      case 'cruise':
        if (event.time) meta.push({ k: "TIME", v: event.time });
        if (event.location) meta.push({ k: "LOCATION", v: event.location });
        break;
      case 'ancillaries':
        const sub = event.subCategory || "visa";
        if (sub === "visa") {
          if (event.country) meta.push({ k: "COUNTRY", v: event.country });
          if (event.visaType) meta.push({ k: "VISA TYPE", v: event.visaType });
          if (event.visaDuration) meta.push({ k: "DURATION", v: event.visaDuration });
          if (event.entryMethod) meta.push({ k: "ENTRY", v: event.entryMethod });
        } else if (sub === "forex") {
          if (event.forexCurrency) meta.push({ k: "CURRENCY", v: event.forexCurrency });
          if (event.amount) meta.push({ k: "AMOUNT", v: event.amount.toString() });
          if (event.baseCurrency) meta.push({ k: "BASE CURR", v: event.baseCurrency });
        } else if (sub === "travel-insurance") {
          if (event.insuranceType) meta.push({ k: "INSURANCE", v: event.insuranceType });
          if (event.noOfTravellers) meta.push({ k: "TRAVELLERS", v: event.noOfTravellers.toString() });
          if (event.sumInsured) meta.push({ k: "SUM INSURED", v: event.sumInsured.toString() });
        }
        break;
      case 'others':
      case 'other':
        if (event.subCategory) meta.push({ k: "TYPE", v: event.subCategory === "gift-cards" ? "Gift Card" : "Travel Gear" });
        break;
    }
    return meta;
  };

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'flight': return '✈';
      case 'hotel': return '🏨';
      case 'activity': return '📷';
      case 'meal': return '🍴';
      case 'transfer': return '🚗';
      case 'ancillaries': return '📋';
      case 'cruise': return '🚢';
      case 'others':
      case 'other': return '📦';
      case 'note': return '📝';
      default: return '📍';
    }
  };

  const travelImages = [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
  ];

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#fff", minHeight: "100vh", color: "#1a1a1a" }}>
      {/* Hero */}
      <div style={{ position: "relative", height: 360, overflow: "hidden" }}>
        <img
          src={itinerary.gallery?.[0]?.url || travelImages[0]}
          alt="Hero"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
        }} />
        <div style={{
          position: "absolute", top: 16, left: 16,
          background: "#F0C105", color: "#1a1a1a",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
          padding: "5px 12px", borderRadius: 999, fontFamily: "sans-serif",
        }}>
          ● {itinerary.branding?.companyName?.toUpperCase() || "TRAV PLATFORMS"}
        </div>
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "#fff", border: "0.5px solid #eee",
          borderRadius: 12, padding: "10px 14px", textAlign: "right",
        }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: "#888", fontFamily: "sans-serif" }}>CURATED BY</p>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 400, color: "#1a1a1a" }}>{itinerary.branding?.companyName || "Travel Agency"}</h3>
          <div style={{ color: "#F0C105", fontSize: 10 }}>★★★★★</div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 24px" }}>
          <div style={heroTag}>PREMIUM ITINERARY</div>
          <h1 style={{ fontSize: 42, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.05, fontFamily: "Georgia, serif" }}>
            {itinerary.title || "Untitled Itinerary"}
          </h1>
          <p style={{ fontSize: 13, color: "#666", marginTop: 6, maxWidth: 500, fontFamily: "sans-serif" }}>
            Traveling {itinerary.country ? `to ${itinerary.country}` : ""} {startDate ? `on ${formatDate(startDate)}` : ""} — a handcrafted {days.length}-day journey through history, culture & timeless elegance.
          </p>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.3em", color: "#888", marginTop: 6, fontFamily: "sans-serif" }}>
            {itinerary.productId || "ITN-NEW"}
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
        border: "0.5px solid #eee", borderRadius: 16, overflow: "hidden",
        margin: "-28px 16px 0", position: "relative", zIndex: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>
        {[
          { lbl: "PREPARED FOR", val: previewConfig.customerName || "Valued Guest" },
          { lbl: "DESTINATION", val: itinerary.country || "Multiple" },
          { lbl: "TRAVELERS", val: `${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}` },
          { lbl: "DURATION", val: `${days.length} Days / ${Math.max(0, days.length - 1)} Nights` },
          { lbl: "TRAVEL DATES", val: startDate && endDate ? formatDateRange(startDate, endDate) : "Flexible" },
        ].map((cell, i) => (
          <div key={i} style={{
            background: "#fff", padding: "14px 16px",
            borderRight: i < 4 ? "0.5px solid #eee" : "none",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", color: "#888", marginBottom: 4, fontFamily: "sans-serif" }}>{cell.lbl}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a", fontFamily: "sans-serif" }}>{cell.val}</div>
          </div>
        ))}
      </div>

      {/* Day-wise Itinerary */}
      <div style={{ padding: "32px 16px 24px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", color: "#9A7B00", fontFamily: "sans-serif" }}>YOUR JOURNEY</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 400, color: "#1a1a1a", marginTop: 4 }}>Day-wise Itinerary</h2>
        </div>

        {days.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>No days found in this itinerary.</div>
        )}

        {days.map((day: any, dayIdx: number) => {
          const dayDate = startDate ? new Date(startDate.getTime() + dayIdx * 24 * 60 * 60 * 1000) : null;
          const dayTotal = calculateTotalPrice(day.events || [], pricingConfig).total;

          return (
            <div key={dayIdx} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, marginBottom: 28 }}>
              {/* Aside */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: "#9A7B00", fontFamily: "sans-serif" }}>DAY {String(dayIdx + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#888", marginTop: 2, fontFamily: "sans-serif" }}>{dayDate ? formatDate(dayDate) : ""}</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, lineHeight: 1.2, color: "#1a1a1a", marginTop: 4 }}>{day.title || `Day ${dayIdx + 1}`}</div>
                <div style={{ width: "100%", height: 80, borderRadius: 10, overflow: "hidden", marginTop: 8 }}>
                  <img 
                    src={day.events?.map(getEventImage).find((img: any) => img) || travelImages[dayIdx % travelImages.length]} 
                    alt={day.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
                {showPrices && (
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#888", marginTop: 6, fontFamily: "sans-serif" }}>
                    Day total · <span style={{ color: "#1a1a1a" }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: displayCurrency, maximumFractionDigits: 0 }).format(dayTotal || 0)}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(!day.events || day.events.length === 0) && (
                  <div style={{ fontSize: 12, color: "#888", fontStyle: "italic" }}>No activities planned for this day.</div>
                )}
                {day.events?.map((event: any, idx: number) => {
                  const meta = getEventMeta(event);
                  const priceResult = calculateComponentPrice(event, pricingConfig);
                  const price = priceResult ? priceResult.calculatedPrice : 0;
                  const isNote = event.category === 'note';

                  return (
                    <div key={idx} style={{
                      border: "0.5px solid #eee", borderRadius: 12,
                      padding: 14, background: isNote ? "#FFFDE7" : "#fff",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        {!isNote && (
                          <div style={{
                            width: 40, height: 40, borderRadius: 10, background: "#FFF8E1",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, flexShrink: 0, border: "0.5px solid rgba(240,193,5,0.3)",
                          }}>
                            {getEventIcon(event.category)}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          {!isNote && (
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", color: "#888", fontFamily: "sans-serif" }}>{event.category?.toUpperCase()}</div>
                              {event.category === 'hotel' && (
                                <>
                                  {event.hotelNightIndex === 1 && (
                                    <div style={{ fontSize: 8, background: "#e6f4ea", color: "#1e7e34", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>CHECK-IN</div>
                                  )}
                                  {event.hotelNightIndex === event.hotelTotalNights + 1 && (
                                    <div style={{ fontSize: 8, background: "#fce8e6", color: "#d93025", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>CHECK-OUT</div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                          {!isNote && <div style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#1a1a1a" }}>{event.title}</div>}
                          
                          {meta.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px 12px", marginTop: 10 }}>
                              {meta.map((m) => (
                                <div key={m.k}>
                                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#888", fontFamily: "sans-serif" }}>{m.k}</div>
                                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1a1a1a", fontFamily: "sans-serif" }}>{m.v}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {isDetailed && event.description && event.description !== "No description provided" && (
                            <div style={{ fontSize: 12, color: isNote ? "#5D4037" : "#666", marginTop: isNote ? 0 : 8, lineHeight: 1.5, fontFamily: "sans-serif", whiteSpace: "pre-wrap" }}>{event.description}</div>
                          )}

                          {/* Amenities */}
                          {event.amenities && event.amenities.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                              {event.amenities.map((amenity: string, aIdx: number) => (
                                <div key={aIdx} style={{ fontSize: 10, background: "#f0f0f0", padding: "2px 8px", borderRadius: 4, color: "#666" }}>
                                  {amenity}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Highlights */}
                          {event.highlights && event.highlights.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "#888", marginBottom: 2 }}>HIGHLIGHTS</div>
                              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: "#444" }}>
                                {event.highlights.map((h: string, hIdx: number) => (
                                  <li key={hIdx}>{h}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Additional Info Sections */}
                          {event.additionalInfoSections && event.additionalInfoSections.length > 0 && (
                            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                              {event.additionalInfoSections.map((section: any, sIdx: number) => (
                                <div key={sIdx} style={{ padding: "6px 10px", background: "#f8f9fa", borderLeft: "2px solid #F0C105", borderRadius: "0 4px 4px 0" }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: "#1a1a1a" }}>{section.heading}</div>
                                  <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{section.content}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Images */}
                          {event.images && event.images.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginTop: 10 }}>
                              {event.images.map((img: string, imgIdx: number) => (
                                <div key={imgIdx} style={{ height: 60, borderRadius: 6, overflow: "hidden" }}>
                                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {showPrices && priceResult && price > 0 && (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 500, color: "#1a1a1a" }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: displayCurrency, maximumFractionDigits: 0 }).format(price)}</div>
                            <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "#888", fontFamily: "sans-serif" }}>PER PACKAGE</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Box */}
      {showPrices && (
        <div style={{
          border: "0.5px solid #eee", borderRadius: 16, overflow: "hidden",
          background: "#fff", margin: "0 16px 28px",
        }}>
          <div style={{ height: 5, background: "#F0C105" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 20 }}>
            <div>
              <div style={heroTag}>INVESTMENT DETAIL</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: "#1a1a1a", marginTop: 8 }}>Pricing Summary</h2>
              <p style={{ fontSize: 12, color: "#888", marginTop: 6, lineHeight: 1.6, fontFamily: "sans-serif" }}>
                A comprehensive breakdown of your travel investment, tailored to your unique preferences and selected inclusions.
              </p>
            </div>
            <div style={{ border: "0.5px solid #eee", borderRadius: 12, background: "#fafafa", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#9A7B00", fontFamily: "sans-serif" }}>GRAND TOTAL</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 500, color: "#1a1a1a" }}>{displayTotal}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#888", fontFamily: "sans-serif" }}>/ {totalPax} PAX</span>
                </div>
              </div>
              <hr style={{ border: "none", borderTop: "1px dashed #eee", margin: "12px 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", color: "#888", fontFamily: "sans-serif" }}>PER PERSON</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 500, color: "#9A7B00" }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: displayCurrency, maximumFractionDigits: 0 }).format(finalTotal / (totalPax || 1))}</span>
              </div>
              <button className="no-print" style={{
                width: "100%", background: "#F0C105", color: "#1a1a1a",
                border: "none", borderRadius: 10, height: 42,
                fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
                cursor: "pointer", marginTop: 14, fontFamily: "sans-serif",
              }}>
                PROCEED TO PAYMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        borderTop: "0.5px solid #eee", padding: "16px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h4 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 400, color: "#1a1a1a" }}>{itinerary.branding?.companyName || "TRAV PLATFORMS"}</h4>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#888", fontFamily: "sans-serif" }}>© {new Date().getFullYear()} ALL RIGHTS RESERVED</p>
      </div>
    </div>
  );
}

// Shared styles
const btnBack: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 6,
  fontSize: 13, fontWeight: 500, padding: "6px 12px",
  border: "0.5px solid #ddd", borderRadius: 999,
  background: "transparent", color: "#1a1a1a", cursor: "pointer",
  fontFamily: "sans-serif",
};

const btnOutline: React.CSSProperties = {
  background: "transparent", border: "0.5px solid #ddd",
  borderRadius: 999, padding: "6px 12px",
  fontSize: 12, fontWeight: 500, color: "#1a1a1a", cursor: "pointer",
  fontFamily: "sans-serif",
};

const btnExport: React.CSSProperties = {
  background: "#F0C105", color: "#1a1a1a",
  border: "none", borderRadius: 999, padding: "6px 14px",
  fontSize: 12, fontWeight: 700, cursor: "pointer",
  fontFamily: "sans-serif",
};

const heroTag: React.CSSProperties = {
  display: "inline-block", background: "#FFF8E1",
  border: "0.5px solid rgba(240,193,5,0.4)", color: "#9A7B00",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
  padding: "3px 10px", borderRadius: 4, marginBottom: 8,
  fontFamily: "sans-serif",
};