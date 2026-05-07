import { useState } from "react";

/* ─── SVG Icons ─── */
const Icons = {
  Star: () => (
    <svg viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 26, height: 26 }}>
      <path d="M13 2L15.5 9H23L17 13.5L19.5 20.5L13 16L6.5 20.5L9 13.5L3 9H10.5L13 2Z" stroke="#e8c87a" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  Mail: ({ size = 12 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
      <path d="M2 3.5h12v9H2zM2 3.5l6 5 6-5" />
    </svg>
  ),
  Phone: ({ size = 12 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
      <path d="M10.5 9.5s1.5 1.5 1.5 2.5c0 .5-.5 1.5-1.5 2-1 .5-3-1-5-3S2.5 6 3 5c.5-1 1.5-1.5 2-1.5 1 0 2.5 1.5 2.5 1.5s.5 1-.5 2-.5 2.5-.5 2.5" />
    </svg>
  ),
  Clock: ({ size = 12 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
      <circle cx="8" cy="8" r="6" /><path d="M8 4v4l2.5 2.5" />
    </svg>
  ),
  Pin: ({ size = 12 }: { size?: number }) => (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
      <path d="M7 1.5C4.5 1.5 2.5 3.5 2.5 6c0 3.5 4.5 6.5 4.5 6.5S11.5 9.5 11.5 6c0-2.5-2-4.5-4.5-4.5z" />
      <circle cx="7" cy="6" r="1.5" />
    </svg>
  ),
  Calendar: ({ size = 13 }: { size?: number }) => (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
      <rect x="1" y="2.5" width="12" height="10" rx="1" /><path d="M1 5.5h12M4.5 2v2.5M9.5 2v2.5" />
    </svg>
  ),
  Person: ({ size = 13 }: { size?: number }) => (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: size, height: size }}>
      <circle cx="7" cy="4.5" r="2.5" /><path d="M1.5 12c0-2.5 2.2-4.5 5.5-4.5S12.5 9.5 12.5 12" />
    </svg>
  ),
  Globe: ({ size = 15 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: size, height: size }}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 1.5C8 1.5 6 4.5 6 8s2 6.5 2 6.5M8 1.5C8 1.5 10 4.5 10 8s-2 6.5-2 6.5M1.5 8h13M2 5.5h12M2 10.5h12" />
    </svg>
  ),
  Instagram: ({ size = 15 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: size, height: size }}>
      <rect x="2" y="2" width="12" height="12" rx="3.5" /><circle cx="8" cy="8" r="2.8" />
      <circle cx="11.5" cy="4.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  Facebook: ({ size = 15 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: size, height: size }}>
      <path d="M9.5 3H11V1H9C7.5 1 6.5 2 6.5 3.5V5H5v2h1.5v7h2V7H10l.5-2H8.5V3.5c0-.3.2-.5.5-.5h.5z" />
    </svg>
  ),
  Twitter: ({ size = 15 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: size, height: size }}>
      <path d="M2 2.5l5 5.5-5 5.5h1.5l4.5-4.5 4 4.5H14l-5-5.5L14 2.5h-1.5L8 7l-4-4.5H2z" />
    </svg>
  ),
  YouTube: ({ size = 15 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: size, height: size }}>
      <rect x="1" y="3.5" width="14" height="9" rx="2.5" />
      <path d="M6.5 6l4 2.5-4 2.5V6z" fill="currentColor" stroke="none" />
    </svg>
  ),
  WhatsApp: ({ size = 15 }: { size?: number }) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" style={{ width: size, height: size }}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5.5 10.5c1 .5 3.5.5 5-2s-.5-4.5-2.5-4c-.5.1-1 .5-1 1s.5 1.5.5 1.5S7 8 6 8.5s-.5 2-.5 2z" />
    </svg>
  ),
  Flight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  Hotel: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}>
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  ),
  Transfer: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 14, height: 14 }}>
      <rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
};

/* ─── Sub-components ─── */

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, marginTop: 12 }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #ede6d8)" }} />
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#0f1b2d", whiteSpace: "nowrap", letterSpacing: 0.5 }}>{title}</div>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #ede6d8, transparent)" }} />
    </div>
  );
}

function InfoCard({ title, rows }: { title: string, rows: any[] }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #ede6d8", borderRadius: 12, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#a08c68", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16, borderBottom: "1px solid #f3ede3", paddingBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        {rows.map((row, i) => (row.value && (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ width: 32, height: 32, background: "#f9f6f1", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#a08c68", border: "1px solid #f0e9dd" }}>
              {row.icon}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#a08c68", fontWeight: 500, marginBottom: 2 }}>{row.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1410" }}>{row.value}</div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}

function SocialIcon({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <a href={href || "#"} target="_blank" rel="noopener noreferrer" style={{ width: 34, height: 34, borderRadius: "50%", background: "#fff", border: "1px solid #ede6d8", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f1b2d", textDecoration: "none", transition: "all 0.2s ease" }}>
      {children}
    </a>
  );
}

function TimelineItem({ event, isLast }: { event: any, isLast: boolean }) {
  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'flight': return <Icons.Flight />;
      case 'hotel': return <Icons.Hotel />;
      case 'transfer': return <Icons.Transfer />;
      default: return <Icons.Activity />;
    }
  };

  const catColor = "#0f1b2d"; // Consistent Professional Navy

  return (
    <div style={{ display: "flex", gap: 0, position: "relative" }}>
      {/* Timeline Rail */}
      <div style={{ width: 60, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e8c87a", border: "2px solid #fff", zIndex: 2, marginTop: 22, boxShadow: "0 0 0 2px #e8c87a22" }} />
        {!isLast && <div style={{ width: 1, flex: 1, background: "#ede6d8", margin: "4px 0" }} />}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, paddingBottom: 32 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #ede6d8", overflow: "hidden", display: "flex", flexDirection: "row", minHeight: 120, boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          {/* Accent Side */}
          <div style={{ width: 4, background: "#e8c87a" }} />
          
          {/* Main Card Content */}
          <div style={{ flex: 1, padding: "18px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f9f6f1", padding: "4px 10px", borderRadius: 6, border: "1px solid #f0e9dd" }}>
                    <span style={{ color: "#a08c68" }}>{getCategoryIcon(event.category)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#a08c68", letterSpacing: 1, textTransform: "uppercase" }}>{event.category}</span>
                  </div>
                  {event.startTime && <span style={{ fontSize: 11, color: "#0f1b2d", fontWeight: 700, background: "#e8c87a33", padding: "2px 8px", borderRadius: 4 }}>{event.startTime}</span>}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f1b2d", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>{event.title}</div>
              </div>
              
              {event.hotelRating && (
                <div style={{ color: "#e8c87a", fontSize: 12, letterSpacing: 2 }}>{"★".repeat(event.hotelRating)}</div>
              )}
            </div>

            {event.description && <div style={{ fontSize: 13, color: "#6b5d4a", lineHeight: 1.6, marginBottom: 14, maxWidth: "90%" }}>{event.description}</div>}

            {/* Structured Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {event.location && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#a08c68" }}>
                  <Icons.Pin size={10} /> <span style={{ fontWeight: 600 }}>{event.location}</span>
                </div>
              )}
              {event.airlines && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#a08c68" }}>
                  <Icons.Flight /> <span style={{ fontWeight: 600 }}>{event.airlines} {event.flightNumber}</span>
                </div>
              )}
              {event.transferType && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#a08c68" }}>
                  <Icons.Transfer /> <span style={{ fontWeight: 700, color: "#e8c87a" }}>{event.transferType.toUpperCase()}</span>
                </div>
              )}
            </div>

            {event.fromLocation && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, background: "#f9f6f1", padding: "10px 16px", borderRadius: 8, border: "1px dashed #e0d5bf" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f1b2d" }}>{event.fromLocation}</span>
                <span style={{ color: "#e8c87a", fontWeight: 700 }}>→</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0f1b2d" }}>{event.toLocation}</span>
              </div>
            )}

            {event.highlights && event.highlights.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {event.highlights.map((h: string, hi: number) => (
                  <span key={hi} style={{ fontSize: 10, fontWeight: 600, color: "#2d7a4f", background: "#ecf8f1", padding: "4px 12px", borderRadius: 4, border: "1px solid #d1eada" }}>✦ {h}</span>
                ))}
              </div>
            )}
          </div>

          {/* Image Side */}
          {event.image && (
            <div style={{ width: 160, position: "relative", borderLeft: "1px solid #f3ede3" }}>
              <img src={event.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent, rgba(255,255,255,0.05))" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineDay({ dayData, isFirst }: { dayData: any, isFirst: boolean }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Professional Day Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 28 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, color: "#0f1b2d", opacity: 0.15, lineHeight: 0.8 }}>{String(dayData.day || dayData.dayNumber).padStart(2, '0')}</div>
        <div style={{ height: 2, flex: 1, background: "linear-gradient(90deg, #e8c87a, transparent)" }} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#a08c68", letterSpacing: 2, textTransform: "uppercase" }}>{dayData.date ? new Date(dayData.date).toLocaleDateString('en-IN', { weekday: 'long' }) : `Journal Day`}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f1b2d", fontFamily: "'Cormorant Garamond', serif" }}>{dayData.title}</div>
        </div>
      </div>

      {/* Events Timeline */}
      <div style={{ paddingLeft: 0 }}>
        {(dayData.events || []).map((ev: any, i: number) => (
          <TimelineItem 
            key={i} 
            event={ev} 
            isLast={i === dayData.events.length - 1} 
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function EliteEleganceTemplate({ 
  itinerary, 
  showPrices, 
  showItemizedPrices = true, 
  isDetailed = true, 
  currency, 
  exchangeRates 
}: any) {
  if (!itinerary) return null;

  const branding = itinerary.branding || {};
  const companyName = branding.companyName || "Arshpreet Travels";
  const tagline = branding.tagline || "Luxury Travel Curators";
  const address = branding.address || "Connaught Place, Central Delhi";
  const contactPhone = branding.contactPhone || "6261794749";
  const contactEmail = branding.contactEmail || "arshsinghbhatia0911@gmail.com";
  const logo = branding.logo || null;
  const socialLinks = branding.socialLinks || {
    instagram: "#",
    facebook: "#",
    twitter: "#",
    youtube: "#",
    whatsapp: "#",
    website: "#",
  };

  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const year = new Date().getFullYear();

  const totalPrice = itinerary.totalPrice || 0;
  const displayCurrency = currency || itinerary.currency || "INR";

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: displayCurrency,
    minimumFractionDigits: 0,
  }).format(totalPrice);

  const heroImage = itinerary.gallery?.[0]?.url || itinerary.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85";
  
  const headerImage = itinerary?.headerFooter?.headerImage || branding.headerImage;
  const footerImage = itinerary?.headerFooter?.footerImage || branding.footerImage;
  const footerContactInfo = itinerary?.headerFooter?.contactInfo;

  const days = itinerary.days || [];
  const hotels = days.flatMap((d: any) => d.events || []).filter((e: any) => e.category === 'hotel');

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#1a1410", background: "#fdfcf9", maxWidth: 860, margin: "0 auto", border: "1px solid #e8e0d4", boxShadow: "0 10px 50px rgba(15, 27, 45, 0.08)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* ── HEADER ── */}
      <header style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr auto 1fr", 
        alignItems: "center", 
        padding: "28px 40px", 
        background: headerImage ? `linear-gradient(rgba(15, 27, 45, 0.85), rgba(15, 27, 45, 0.85)), url(${headerImage})` : "#0f1b2d",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        gap: 16 
      }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#e8c87a", letterSpacing: 0.5 }}>{companyName}</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>{tagline}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, border: "1px solid #e8c87a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(232,200,122,0.05)", margin: "0 auto" }}>
            {logo ? <img src={logo} alt="Logo" style={{ maxWidth: "70%", maxHeight: "70%" }} /> : <Icons.Star />}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
            <Icons.Mail /> {contactEmail}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
            <Icons.Phone /> {contactPhone}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
        <img src={heroImage} alt={itinerary.destination} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,18,30,0.95) 0%, rgba(10,18,30,0.3) 60%, transparent 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "48px 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "inline-block", background: "#e8c87a", color: "#0f1b2d", fontSize: 10, fontWeight: 800, letterSpacing: 2.5, padding: "5px 14px", borderRadius: 4, marginBottom: 16, textTransform: "uppercase" }}>The Elite Experience</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 16 }}>{itinerary.title}</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { icon: <Icons.Pin size={14} />, text: itinerary.destination || itinerary.country },
                { icon: <Icons.Calendar size={14} />, text: itinerary.startDate ? `${new Date(itinerary.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – ${itinerary.endDate ? new Date(itinerary.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}` : "Bespoke Dates" },
                { icon: <Icons.Person size={14} />, text: itinerary.customerName || "Valued Guest" },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
                  <span style={{ color: "#e8c87a" }}>{m.icon}</span>{m.text}
                </div>
              ))}
            </div>
          </div>
          {showPrices && totalPrice > 0 && (
            <div style={{ textAlign: "right", marginLeft: 20 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Investment Starts At</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 700, color: "#e8c87a", lineHeight: 1 }}>{formattedPrice}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Value per person</div>
            </div>
          )}
        </div>
      </div>

      {/* ── ACCENT BAR ── */}
      <div style={{ background: "#e8c87a", display: "flex", justifyContent: "center", gap: 48, padding: "14px 40px", flexWrap: "wrap" }}>
        {["ULTRA LUXURY STAYS", "24/7 CONCIERGE", "PRIVATE CHAUFFEUR", "ELITE EXPERIENCES"].map((t) => (
          <div key={t} style={{ fontSize: 10, fontWeight: 800, color: "#0f1b2d", letterSpacing: 1.5 }}>✦ {t}</div>
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "48px 40px" }}>

        {/* Guest + Trip Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
          <InfoCard title="The Guest" rows={[
            { icon: <Icons.Person size={14} />, label: "Principal Guest", value: itinerary.customerName || "Valued Guest" },
            { icon: <Icons.Mail size={14} />, label: "Email Correspondence", value: itinerary.customerEmail },
            { icon: <Icons.Pin size={14} />, label: "Origin / Nationality", value: itinerary.nationality },
            { icon: <Icons.Person size={14} />, label: "Travel Party", value: itinerary.pax || (itinerary.adults ? `${itinerary.adults} Adults` : null) },
          ]} />
          <InfoCard title="The Journey" rows={[
            { icon: <Icons.Calendar size={14} />, label: "Travel Window", value: itinerary.startDate ? `${new Date(itinerary.startDate).toLocaleDateString()} – ${itinerary.endDate ? new Date(itinerary.endDate).toLocaleDateString() : 'TBD'}` : "Flexible" },
            { icon: <Icons.Clock size={14} />, label: "Total Duration", value: itinerary.duration || (itinerary.nights ? `${itinerary.nights} Nights` : null) },
            { icon: <Icons.Pin size={14} />, label: "Key Destinations", value: itinerary.destination || itinerary.country },
            { icon: <Icons.Star />, label: "Service Tier", value: itinerary.category || "Luxury Portfolio" },
          ]} />
        </div>

        {/* Professional Accommodations */}
        {hotels.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <SectionHeader title="Curated Accommodations" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {hotels.slice(0, 4).map((h: any, i: number) => (
                <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #ede6d8", background: "#fff", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                  <div style={{ height: 160, overflow: "hidden" }}>
                    <img src={h.image || h.imageUrl || "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80"} alt={h.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ color: "#e8c87a", fontSize: 12, marginBottom: 6, letterSpacing: 2 }}>{"★".repeat(h.hotelRating || 5)}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#0f1b2d", marginBottom: 4, fontFamily: "'Cormorant Garamond', serif" }}>{h.title}</div>
                    <div style={{ fontSize: 11, color: "#a08c68", display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
                      <Icons.Pin size={10} /> {h.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Itinerary Timeline */}
        <SectionHeader title="The Daily Journal" />
        <div style={{ marginTop: 32 }}>
          {days.map((day: any, i: number) => (
            <TimelineDay
              key={i}
              dayData={day}
              isFirst={i === 0}
            />
          ))}
        </div>

        {/* Legal & T&C */}
        <div style={{ marginTop: 48, padding: "32px", border: "1px solid #ede6d8", borderRadius: 16, background: "#fff" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f1b2d", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Important Notes & Conditions</div>
          <p style={{ fontSize: 12, color: "#6b5d4a", lineHeight: 1.8, margin: 0 }}>
            Pricing is calculated based on current availability and exchange rates. All arrangements are subject to final confirmation. Visa requirements and travel insurance remain the traveler's responsibility unless specified. {companyName} maintains a commitment to excellence and will strive to ensure all aspects of this journal are delivered to the highest standards.
          </p>
        </div>

        {/* Professional Contact Footer */}
        <div style={{ textAlign: "center", padding: "40px 0 0", marginTop: 40, borderTop: "1px solid #ede6d8" }}>
          {footerContactInfo ? (
            <div style={{ whiteSpace: 'pre-wrap', color: "#6b5d4a", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{footerContactInfo}</div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "#a08c68", marginBottom: 16, fontWeight: 500 }}>FOR INQUIRIES & ADJUSTMENTS</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
                <a href={`tel:${contactPhone}`} style={{ color: "#0f1b2d", fontWeight: 700, textDecoration: "none", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.Phone size={14} /> {contactPhone}
                </a>
                <a href={`mailto:${contactEmail}`} style={{ color: "#0f1b2d", fontWeight: 700, textDecoration: "none", fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Icons.Mail size={14} /> {contactEmail}
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── FOOTER BAR ── */}
      <div style={{ 
        background: footerImage ? `linear-gradient(rgba(15, 27, 45, 0.15), rgba(15, 27, 45, 0.15)), url(${footerImage})` : "#0f1b2d",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: "18px 40px", 
        textAlign: "center", 
        fontSize: 10, 
        fontWeight: 800, 
        color: "#e8c87a", 
        letterSpacing: 6, 
        textTransform: "uppercase",
        textShadow: footerImage ? "0 1px 3px rgba(0,0,0,0.6)" : "none"
      }}>
        CURATED EXCLUSIVELY BY {companyName}
      </div>

      {/* ── SOCIAL FOOTER ── */}
      <div style={{ background: "#f9f6f1", padding: "48px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, borderTop: "1px solid #ede6d8" }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: "#0f1b2d" }}>{companyName}</div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", fontSize: 12, color: "#6b5d4a", fontWeight: 500 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Icons.Pin size={12} /> {address}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Icons.Globe size={12} /> Travel Concierge</span>
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <SocialIcon href={socialLinks.instagram}><Icons.Instagram /></SocialIcon>
          <SocialIcon href={socialLinks.facebook}><Icons.Facebook /></SocialIcon>
          <SocialIcon href={socialLinks.twitter}><Icons.Twitter /></SocialIcon>
          <SocialIcon href={socialLinks.youtube}><Icons.YouTube /></SocialIcon>
          <SocialIcon href={socialLinks.whatsapp}><Icons.WhatsApp /></SocialIcon>
          <SocialIcon href={socialLinks.website}><Icons.Globe /></SocialIcon>
        </div>

        <div style={{ fontSize: 11, color: "#a08c68", fontWeight: 500, letterSpacing: 0.5 }}>
          © {year} {companyName.toUpperCase()}. ALL RIGHTS RESERVED. · REGISTERED LUXURY TRAVEL PARTNER
        </div>
      </div>
    </div>
  );
}
