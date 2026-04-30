"use client";

import { useState, useRef, useEffect } from "react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "flight", label: "Flight", icon: "✈", color: "#E6F1FB", border: "#378ADD", text: "#0C447C" },
  { id: "hotel", label: "Hotel", icon: "🏨", color: "#EAF3DE", border: "#639922", text: "#27500A" },
  { id: "activity", label: "Activity", icon: "🎯", color: "#FAEEDA", border: "#BA7517", text: "#633806" },
  { id: "transfer", label: "Transfer", icon: "🚗", color: "#EEEDFE", border: "#7F77DD", text: "#3C3489" },
  { id: "meal", label: "Meal", icon: "🍴", color: "#FAECE7", border: "#D85A30", text: "#712B13" },
  { id: "cruise", label: "Cruise", icon: "🚢", color: "#E1F5EE", border: "#1D9E75", text: "#085041" },
  { id: "ancillaries", label: "Ancillaries", icon: "📋", color: "#FBEAF0", border: "#D4537E", text: "#72243E" },
];

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

const INITIAL_ITEMS = [
  {
    id: "1", date: "2024-03-15", category: "flight", name: "Delhi → Dubai Emirates",
    price: 28500, quantity: 2, airline: "Emirates", flightNumber: "EK511",
    fromCity: "Delhi", toCity: "Dubai", startTime: "06:25", description: "Non-stop flight with complimentary meals.",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80"
  },
  {
    id: "2", date: "2024-03-15", category: "hotel", name: "Atlantis The Palm",
    price: 18000, quantity: 3, hotelName: "Atlantis The Palm", roomCategory: "Ocean Suite",
    location: "Palm Jumeirah, Dubai", description: "5-star luxury resort with private beach access.",
    imageUrl: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=400&q=80"
  },
  {
    id: "3", date: "2024-03-16", category: "activity", name: "Desert Safari & BBQ Dinner",
    price: 4200, quantity: 2, location: "Dubai Desert", duration: "6 hours",
    description: "Thrilling dune bashing, camel rides, and authentic Arabian dinner.",
    imageUrl: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80"
  },
  {
    id: "4", date: "2024-03-17", category: "transfer", name: "Airport to Hotel Transfer",
    price: 1800, quantity: 1, fromLocation: "Dubai Airport T3", toLocation: "Atlantis Palm",
    vehicleType: "Mercedes E-Class", description: "Private luxury transfer with meet & greet.",
    imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80"
  },
  {
    id: "5", date: "2024-03-18", category: "meal", name: "Dinner at Nobu Restaurant",
    price: 6500, quantity: 2, location: "Atlantis The Palm", cuisine: "Japanese Fusion",
    startTime: "20:00", description: "World-renowned Japanese cuisine at iconic Nobu.",
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80"
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatCurrency(amount, currency) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

function groupByDate(items) {
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});
}

function getCatMeta(item) {
  const m = [];
  if (item.category === "flight") {
    if (item.airline) m.push({ k: "Airline", v: item.airline });
    if (item.flightNumber) m.push({ k: "Flight No", v: item.flightNumber });
    if (item.fromCity && item.toCity) m.push({ k: "Route", v: `${item.fromCity} → ${item.toCity}` });
    if (item.startTime) m.push({ k: "Dep. Time", v: item.startTime });
  }
  if (item.category === "hotel") {
    if (item.hotelName) m.push({ k: "Property", v: item.hotelName });
    if (item.roomCategory) m.push({ k: "Room", v: item.roomCategory });
    if (item.location) m.push({ k: "Location", v: item.location });
    if (item.nights) m.push({ k: "Duration", v: `${item.nights} Nights` });
    if (item.adults) m.push({ k: "Pax", v: `${item.adults}A ${item.children || 0}C` });
    if (item.mealPlan) m.push({ k: "Meal Plan", v: item.mealPlan });
    if (item.propertyType) m.push({ k: "Type", v: item.propertyType });
    if (item.hotelRating) m.push({ k: "Rating", v: `${item.hotelRating}★` });
  }
  if (item.category === "transfer") {
    if (item.fromLocation && item.toLocation) m.push({ k: "Route", v: `${item.fromLocation} → ${item.toLocation}` });
    if (item.vehicleType) m.push({ k: "Vehicle", v: item.vehicleType });
    if (item.pickupTime) m.push({ k: "Pickup", v: item.pickupTime });
  }
  if (item.category === "activity") {
    if (item.location) m.push({ k: "Location", v: item.location });
    if (item.duration) m.push({ k: "Duration", v: item.duration });
    if (item.startTime) m.push({ k: "Starts", v: item.startTime });
  }
  if (item.category === "meal") {
    if (item.mealType) m.push({ k: "Meal", v: item.mealType });
    if (item.startTime) m.push({ k: "Time", v: item.startTime });
    if (item.location) m.push({ k: "Venue", v: item.location });
  }
  if (item.category === "ancillaries") {
    if (item.subCategory) m.push({ k: "Category", v: item.subCategory });
    if (item.country) m.push({ k: "Country", v: item.country });
    if (item.visaType) m.push({ k: "Visa Type", v: item.visaType });
  }
  return m;
}

// ─── PROFESSIONAL BUILDER CARD (DEFAULT TEMPLATE) ─────────────────────────────
function DefaultServiceCard({ item, currency, showPrice }) {
  const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[0];
  const meta = getCatMeta(item);
  const isFlight = item.category === "flight";

  // Date Parse
  const d = new Date(item.date + "T00:00:00");
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <div style={{
      border: "1px solid #eee", borderRadius: 14, background: "#fff",
      overflow: "hidden", height: 190, display: "flex", alignItems: "stretch",
      marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
    }}>
      {/* Golden Date Strip */}
      <div style={{
        width: 70, flexShrink: 0, borderRight: "1px solid #D4AF37",
        background: "linear-gradient(135deg, #FDB931 0%, #E7A500 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: "rgba(69,26,3,0.7)", textTransform: "uppercase", letterSpacing: "0.15em" }}>{weekday}</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: "#451a03", lineHeight: 1, margin: "2px 0" }}>{day}</div>
        <div style={{ fontSize: 11, fontWeight: 900, color: "rgba(69,26,3,0.8)", textTransform: "uppercase", letterSpacing: "0.2em" }}>{month}</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {isFlight ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 20px", borderBottom: "1px solid #f9f9f9", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, background: "#ef4444", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 900 }}>AI</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#1a1a1a" }}>{item.airline} • {item.flightNumber}</div>
            </div>
            <div style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
               <div style={{ textAlign: "center", position: "absolute", left: "50%", transform: "translateX(-50%)", width: "30%" }}>
                 <div style={{ fontSize: 9, fontWeight: 700, color: "#ccc", marginBottom: 4 }}>DIRECT</div>
                 <div style={{ height: 1, borderTop: "1px dashed #ddd", position: "relative" }}>
                   <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%) rotate(90deg)", fontSize: 12 }}>✈️</div>
                 </div>
               </div>
               <div>
                 <div style={{ fontSize: 26, fontWeight: 900, color: "#1a1a1a" }}>{item.fromCity?.substring(0,3).toUpperCase()}</div>
                 <div style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>{item.startTime}</div>
               </div>
               <div style={{ textAlign: "right" }}>
                 <div style={{ fontSize: 26, fontWeight: 900, color: "#1a1a1a" }}>{item.toCity?.substring(0,3).toUpperCase()}</div>
                 <div style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>{item.endTime || "10:30"}</div>
               </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "8px 20px", background: cat.color + "40", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14 }}>{cat.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 900, color: cat.text, letterSpacing: "0.2em" }}>{cat.label.toUpperCase()}</span>
            </div>
            <div style={{ flex: 1, padding: "16px 20px" }}>
              <h4 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, margin: "0 0 12px", color: "#1a1a1a" }}>{item.name}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15 }}>
                {meta.filter(m => m.k !== "Location").map(m => (
                  <div key={m.k}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" }}>{m.k}</div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#333" }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Price */}
        {showPrice && (
          <div style={{ padding: "8px 20px", borderTop: "1px solid #f0f0f0", background: "#fafafa", display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#aaa" }}>{formatCurrency(item.price, currency)} × {item.quantity} =</span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 900, color: "#1a1a1a" }}>{formatCurrency(item.price * item.quantity, currency)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STYLISH CARD ─────────────────────────────────────────────────────────────
function StylishServiceCard({ item, currency, showPrice }) {
  const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[0];
  const meta = getCatMeta(item);
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${hover ? cat.border : "#eee"}`,
        borderRadius: 14, background: "#fff",
        padding: "16px 18px", transition: "all 0.2s ease",
        boxShadow: hover ? "0 4px 20px rgba(0,0,0,0.07)" : "none",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: cat.color,
          border: `1px solid ${cat.border}30`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20, flexShrink: 0,
        }}>
          {cat.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "inline-block", fontSize: 9, fontWeight: 700,
            letterSpacing: "0.15em", color: cat.text,
            background: cat.color, border: `1px solid ${cat.border}40`,
            padding: "2px 8px", borderRadius: 4, marginBottom: 4, fontFamily: "sans-serif",
          }}>
            {cat.label.toUpperCase()}
          </div>
          <div style={{
            fontFamily: "Georgia, serif", fontSize: 16, color: "#1a1a1a",
            fontWeight: 500, lineHeight: 1.3, marginBottom: 8, paddingRight: 60,
          }}>
            {item.name}
          </div>
          {meta.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", marginBottom: 8 }}>
              {meta.map(m => (
                <div key={m.k}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#aaa", fontFamily: "sans-serif" }}>{m.k.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: "#1a1a1a", fontFamily: "sans-serif", fontWeight: 500 }}>{m.v}</div>
                </div>
              ))}
            </div>
          )}
          {item.description && (
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, fontFamily: "sans-serif" }}>
              {item.description}
            </div>
          )}
        </div>
        {showPrice && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 600, color: "#1a1a1a" }}>
              {formatCurrency(item.price * item.quantity, currency)}
            </div>
            <div style={{ fontSize: 10, color: "#aaa", fontFamily: "sans-serif", marginTop: 2 }}>
              {formatCurrency(item.price, currency)} × {item.quantity}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN BUILDER ─────────────────────────────────────────────────────────────
export default function CartComboBuilder() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [title, setTitle] = useState("Dubai Luxury Escape");
  const [description, setDescription] = useState("A meticulously curated 5-day journey through the jewel of the UAE.");
  const [currency, setCurrency] = useState("INR");
  const [showPrices, setShowPrices] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("default"); // default | stylish
  const [gallery, setGallery] = useState([]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("cart-combo-preview");
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.cartItems && data.cartItems.length > 0) setItems(data.cartItems);
          if (data.title) setTitle(data.title);
          if (data.description) setDescription(data.description);
          if (data.currency) setCurrency(data.currency);
          if (data.gallery) setGallery(data.gallery);
        } catch (e) {
          console.error("Failed to parse cart-combo-preview data", e);
        }
      }
    }
  }, []);

  const grouped = groupByDate(items);
  const dates = Object.keys(grouped).sort();
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const heroImage = gallery && gallery.length > 0 
    ? gallery[0].url 
    : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";

  return (
    <div style={{ fontFamily: "Georgia, serif", background: "#F8F7F4", minHeight: "100vh", color: "#1a1a1a" }}>

      {/* ── TOP HEADER ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #eee",
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            background: "#F0C105", width: 36, height: 36, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🧳</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#aaa", fontFamily: "sans-serif" }}>
              TRAV PLATFORMS · PREVIEW
            </div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 500, color: "#1a1a1a" }}>
              Package Quotation
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          {/* Template switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", fontFamily: "sans-serif", textTransform: "uppercase" }}>Templates:</span>
            <div style={{ display: "flex", background: "#f0f0ee", borderRadius: 10, padding: 3, gap: 3 }}>
              {["default", "stylish"].map(temp => (
                <button
                  key={temp}
                  onClick={() => setSelectedTemplate(temp)}
                  style={{
                    padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, fontFamily: "sans-serif",
                    background: selectedTemplate === temp ? "#fff" : "transparent",
                    color: selectedTemplate === temp ? "#1a1a1a" : "#888",
                    boxShadow: selectedTemplate === temp ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                    textTransform: "capitalize",
                  }}
                >
                  {temp === "default" ? "✦ Default" : "◎ Stylish"}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <select
            value={currency} onChange={e => setCurrency(e.target.value)}
            style={{
              height: 36, border: "1px solid #eee", borderRadius: 8, padding: "0 10px",
              fontSize: 12, fontWeight: 600, fontFamily: "sans-serif", background: "#fff",
              cursor: "pointer", color: "#1a1a1a",
            }}
          >
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Price toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <div
              onClick={() => setShowPrices(p => !p)}
              style={{
                width: 40, height: 22, borderRadius: 11,
                background: showPrices ? "#1a1a1a" : "#ddd",
                position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                position: "absolute", top: 2, transition: "left 0.2s",
                left: showPrices ? 20 : 2,
              }} />
            </div>
            <span style={{ fontSize: 11, fontFamily: "sans-serif", color: "#888" }}>Pricing</span>
          </label>
        </div>
      </div>

      {/* ── DEFAULT TEMPLATE ── */}
      {selectedTemplate === "default" && (
        <div style={{ minHeight: "calc(100vh - 66px)", padding: "40px 24px", maxWidth: 1000, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 40, borderBottom: "2px solid #eee", paddingBottom: 20 }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 900, color: "#1a1a1a", margin: "0 0 10px" }}>
              {title || "Untitled Package"}
            </h1>
            <p style={{ fontSize: 16, color: "#666", lineHeight: 1.6 }}>{description}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.sort((a,b) => new Date(a.date) - new Date(b.date)).map(item => (
              <DefaultServiceCard
                key={item.id}
                item={item}
                currency={currency}
                showPrice={showPrices}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── STYLISH TEMPLATE ── */}
      {selectedTemplate === "stylish" && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
          {/* Hero */}
          <div style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 20, padding: "60px 40px",
            marginBottom: 32, position: "relative", overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}>
            <div style={{
              position: "absolute", top: 20, right: 20,
              background: "#F0C105", fontSize: 9, fontWeight: 700,
              letterSpacing: "0.2em", padding: "4px 12px", borderRadius: 999,
              color: "#1a1a1a", fontFamily: "sans-serif",
            }}>● TRAV PLATFORMS</div>
            <div style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: "#F0C105",
              fontFamily: "sans-serif", marginBottom: 12,
            }}>PACKAGE QUOTATION</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 400, color: "#fff", marginBottom: 12 }}>
              {title}
            </h1>
            {description && (
              <p style={{ fontSize: 15, color: "#aaa", fontStyle: "italic", maxWidth: 500 }}>
                "{description}"
              </p>
            )}

            {/* Meta row */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1, background: "#333", borderRadius: 12, overflow: "hidden",
              marginTop: 28, border: "1px solid #333",
            }}>
              {[
                { lbl: "Total Services", val: items.length.toString() },
                { lbl: "Travel Days", val: dates.length.toString() },
                { lbl: "Currency", val: currency },
                { lbl: "Total", val: showPrices ? formatCurrency(totalPrice, currency) : "On Request" },
              ].map((cell, i) => (
                <div key={i} style={{ background: "#1a1a1a", padding: "12px 16px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#888", letterSpacing: "0.2em", fontFamily: "sans-serif", marginBottom: 4 }}>{cell.lbl.toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "sans-serif" }}>{cell.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date-wise summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {dates.map((date, dateIdx) => {
              const dateItems = grouped[date] || [];
              const dayTotal = dateItems.reduce((s, i) => s + i.price * i.quantity, 0);

              return (
                <div key={date} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 20 }}>
                  {/* Aside */}
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", color: "#9A7B00", fontFamily: "sans-serif" }}>
                      DATE {String(dateIdx + 1).padStart(2, "0")}
                    </div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1a1a1a", marginTop: 4, lineHeight: 1.3 }}>
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })}
                    </div>
                    {showPrices && (
                      <div style={{ fontSize: 13, color: "#888", marginTop: 6, fontFamily: "sans-serif" }}>
                        {formatCurrency(dayTotal, currency)}
                      </div>
                    )}
                    {dateItems[0]?.imageUrl && (
                      <div style={{ height: 80, borderRadius: 10, overflow: "hidden", marginTop: 10 }}>
                        <img src={dateItems[0].imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                  </div>

                  {/* Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {dateItems.map(item => (
                      <StylishServiceCard
                        key={item.id} item={item}
                        currency={currency} showPrice={showPrices}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Footer */}
          {showPrices && (
            <div style={{
              marginTop: 40, border: "1px solid #eee", borderRadius: 20,
              overflow: "hidden", background: "#fff",
            }}>
              <div style={{ height: 5, background: "#F0C105" }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, padding: 32 }}>
                <div>
                  <div style={{
                    display: "inline-block", fontSize: 9, fontWeight: 700,
                    letterSpacing: "0.2em", color: "#9A7B00", background: "#FFF8E1",
                    border: "1px solid rgba(240,193,5,0.3)", padding: "3px 10px",
                    borderRadius: 4, fontFamily: "sans-serif", marginBottom: 10,
                  }}>INVESTMENT SUMMARY</div>
                  <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: 400, color: "#1a1a1a" }}>
                    Pricing Details
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                    {CATEGORIES.filter(c => items.some(i => i.category === c.id)).map(c => {
                      const catItems = items.filter(i => i.category === c.id);
                      const catTotal = catItems.reduce((s, i) => s + i.price * i.quantity, 0);
                      return (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, color: "#888", fontFamily: "sans-serif" }}>
                            {c.icon} {c.label}
                          </span>
                          <span style={{ fontSize: 13, fontFamily: "Georgia, serif", color: "#1a1a1a" }}>
                            {formatCurrency(catTotal, currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{
                  background: "#fafafa", border: "1px solid #eee",
                  borderRadius: 14, padding: 24, display: "flex",
                  flexDirection: "column", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#9A7B00", fontFamily: "sans-serif" }}>
                    GRAND TOTAL
                  </div>
                  <div style={{ fontFamily: "Georgia, serif", fontSize: 34, color: "#1a1a1a", marginTop: 6 }}>
                    {formatCurrency(totalPrice, currency)}
                  </div>
                  <div style={{ height: 1, background: "#eee", margin: "16px 0" }} />
                  <button style={{
                    width: "100%", height: 46, background: "#F0C105", color: "#1a1a1a",
                    border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
                    cursor: "pointer", letterSpacing: "0.08em", fontFamily: "sans-serif",
                  }}>
                    BOOK THIS PACKAGE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SHARED STYLES ─────────────────────────────────────────────────────────
const labelSt = {
  display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
  color: "#aaa", fontFamily: "sans-serif", marginBottom: 5, textTransform: "uppercase",
};

const inputSt = {
  width: "100%", height: 36, border: "1px solid #e8e8e8",
  borderRadius: 8, padding: "0 12px", fontSize: 13, fontFamily: "sans-serif",
  color: "#1a1a1a", background: "#fff", boxSizing: "border-box",
  outline: "none",
}; 
