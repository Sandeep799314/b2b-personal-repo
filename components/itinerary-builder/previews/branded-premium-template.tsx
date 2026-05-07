import { useState } from "react";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Globe, 
  Phone, 
  Mail, 
  MapPin,
  MessageSquare
} from "lucide-react";

const ATLANTIS_IMG = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=90";
const HOTEL_IMG = "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80";

export function BrandedPremiumTemplate({ 
  itinerary, 
  showPrices, 
  showItemizedPrices = true, 
  isDetailed = true, 
  currency, 
  exchangeRates 
}: any) {
  const [openDay, setOpenDay] = useState<number | null>(itinerary?.days?.length > 0 ? 0 : null);

  const branding = itinerary?.branding || {};
  const companyName = branding.companyName || "Arshpreet Travels";
  const contactPhone = branding.contactPhone || "6261794749";
  const contactEmail = branding.contactEmail || "arshsinghbhatia0911@gmail.com";
  const address = branding.address || "Connaught Place, Central Delhi";
  const socialLinks = branding.socialLinks || {};
  
  const title = itinerary?.title || "Exclusive Journey";
  const destination = itinerary?.destination || itinerary?.country || "Worldwide";
  const totalPrice = itinerary?.totalPrice || 0;
  const displayCurrency = currency || itinerary?.currency || "INR";
  
  const days = itinerary?.days || [];

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: displayCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalPrice);

  const heroImage = itinerary?.gallery?.[0]?.url || itinerary?.image || ATLANTIS_IMG;

  const headerImage = itinerary?.headerFooter?.headerImage || branding.headerImage;
  const footerImage = itinerary?.headerFooter?.footerImage || branding.footerImage;
  const footerContactInfo = itinerary?.headerFooter?.contactInfo;

  const SocialIcon = ({ type, url }: { type: string, url: string }) => {
    if (!url) return null;
    const icons: any = {
      instagram: <Instagram size={18} />,
      facebook: <Facebook size={18} />,
      twitter: <Twitter size={18} />,
      youtube: <Youtube size={18} />,
      website: <Globe size={18} />,
      whatsapp: <MessageSquare size={18} />
    };
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" style={s.socialIcon}>
        {icons[type] || <Globe size={18} />}
      </a>
    );
  };

  return (
    <div style={s.page}>
      <style>{globalCss}</style>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header style={{
        ...s.header,
        backgroundImage: headerImage ? `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${headerImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div style={s.headerLeft}>
          <div style={s.logoBox}>
            {branding.logo ? (
              <img src={branding.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : (
              <span style={s.logoText}>YOUR{"\n"}LOGO</span>
            )}
          </div>
          <div>
            <div style={s.agencyName}>{companyName}</div>
            <div style={s.agencyAddr}>{address}</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.contactLine}><Phone size={14} /> {contactPhone}</div>
          <div style={s.contactLine}><Mail size={14} /> {contactEmail}</div>
        </div>
      </header>

      {/* HERO */}
      <div style={s.heroWrap}>
        <img src={heroImage} alt={destination} style={s.heroImg} />
        <div style={s.heroGradient} />
        <div style={s.heroBadge}>
          <div style={{ flex: 1 }}>
            <div style={s.heroTag}>PREMIUM EXPERIENCE</div>
            <h1 style={s.heroTitle}>{title}</h1>
            <div style={s.heroMeta}>
              <span><MapPin size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} /> {destination}</span>
              <span style={{ marginLeft: 16 }}>🗓 {itinerary?.startDate ? new Date(itinerary.startDate).toLocaleDateString() : "Flexible Dates"}</span>
            </div>
            <div style={s.heroIcons}>
              {["🛏 Luxury Stays", "🧭 Private Tours", "🚗 First Class"].map((t) => (
                <span key={t} style={s.heroIconChip}>{t}</span>
              ))}
            </div>
          </div>
          {showPrices && totalPrice > 0 && (
            <div style={s.heroRight}>
              <div style={s.heroPriceLabel}>Starting From</div>
              <div style={s.heroPrice}>{formattedPrice}</div>
              <div style={s.heroQuery}>ID: <b>{itinerary?.productId || "PREM-001"}</b></div>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={s.body}>
        {/* Guest Details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <SectionTitle>Guest Details</SectionTitle>
            <div style={s.guestRow}>
              <span style={s.guestAvatar}>👤</span>
              <span style={s.guestName}>{itinerary?.customerName || "Valued Guest"}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1 }}>DATE GENERATED</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <HR />

        {/* Hotels */}
        {days.some((d: any) => d.events?.some((e: any) => e.category === 'hotel')) && (
          <>
            <SectionTitle>Premium Accommodations</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {days.flatMap((d: any) => d.events || [])
                .filter((e: any) => e.category === 'hotel')
                .slice(0, 4) // Limit to first 4 for visual balance
                .map((hotel: any, idx: number) => (
                  <div key={idx} style={s.hotelCardSmall}>
                    <img src={hotel.image || hotel.imageUrl || HOTEL_IMG} alt="Hotel" style={s.hotelImgSmall} />
                    <div style={s.hotelInfoSmall}>
                      <div style={s.hotelNameSmall}>{hotel.title}</div>
                      <div style={s.hotelLocSmall}><MapPin size={10} style={{ display: 'inline', marginRight: 2 }} /> {hotel.location}</div>
                      <div style={{ color: "#f59e0b", fontSize: 10 }}>{"★".repeat(hotel.hotelRating || 5)}</div>
                    </div>
                  </div>
                ))}
            </div>
            <HR />
          </>
        )}

        {/* Itinerary */}
        <SectionTitle>Your Curated Itinerary</SectionTitle>

        {days.map((day: any, index: number) => (
          <div key={index}>
            <DayRow 
              day={index + 1} 
              date={day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : `Day ${index + 1}`} 
              open={openDay === index} 
              onToggle={() => setOpenDay(openDay === index ? null : index)}
            >
              <div style={s.daySubTitle}>
                {day.title}
              </div>
              {day.events?.map((event: any, eIdx: number) => (
                <div key={eIdx} style={s.eventBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={s.categoryTag}>{event.category}</span>
                        {event.category === 'transfer' && (event.transferType === 'Private' ? <PrivateTag /> : <SicTag />)}
                      </div>
                      <div style={s.eventTitle}>{event.title}</div>
                      {event.description && <p style={s.dayDesc}>{event.description}</p>}
                    </div>
                    {event.image && (
                      <img src={event.image} alt="" style={s.eventImg} />
                    )}
                  </div>
                  
                  {event.category === 'transfer' && (
                    <div style={s.transferGrid}>
                      <div style={s.transferCell}>
                        <span style={s.transferIcon}>🚖</span>
                        <span><b>{event.fromLocation || "Pickup"}</b></span>
                      </div>
                      <div style={s.arrow}>→</div>
                      <div style={s.transferCell}>
                        <span style={s.transferIcon}>🚖</span>
                        <span><b>{event.toLocation || "Dropoff"}</b></span>
                      </div>
                    </div>
                  )}

                  {event.highlights && event.highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {event.highlights.map((h: string, i: number) => (
                        <span key={i} style={s.highlightChip}>✓ {h}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </DayRow>
            {index < days.length - 1 && <DottedLine />}
          </div>
        ))}

        <HR />

        {/* Footer feedback */}
        <div style={s.footerFeedback}>
          {footerContactInfo ? (
             <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>{footerContactInfo}</div>
          ) : (
            <>
              <span>Questions about your trip? Contact us at </span>
              <a href={`tel:${contactPhone}`} style={{ color: "#2563eb", fontWeight: 700 }}>{contactPhone}</a>
            </>
          )}
        </div>
      </div>

      {/* Thank You bar */}
      <div style={{
        ...s.thankYouPremium,
        background: footerImage ? `linear-gradient(rgba(30, 58, 95, 0.15), rgba(30, 58, 95, 0.15)), url(${footerImage})` : s.thankYouPremium.background,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textShadow: footerImage ? "0 1px 3px rgba(0,0,0,0.6)" : "none"
      }}>
        EXCLUSIVELY CURATED FOR YOU
      </div>

      {/* Social Media Footer */}
      <div style={s.socialFooter}>
        <div style={s.socialContainer}>
          <div style={s.socialBrand}>{companyName}</div>
          <div style={s.socialIcons}>
            <SocialIcon type="instagram" url={socialLinks.instagram} />
            <SocialIcon type="facebook" url={socialLinks.facebook} />
            <SocialIcon type="twitter" url={socialLinks.twitter} />
            <SocialIcon type="youtube" url={socialLinks.youtube} />
            <SocialIcon type="whatsapp" url={socialLinks.whatsapp} />
            <SocialIcon type="website" url={socialLinks.website} />
          </div>
          <div style={s.socialCopyright}>
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Small components ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 14px", fontFamily: "'Playfair Display', serif" }}>{children}</h2>;
}

function HR() {
  return <div style={{ borderTop: "1px solid #e5e7eb", margin: "22px 0" }} />;
}

function DottedLine() {
  return (
    <div style={{
      borderTop: "1px dashed #d1d5db",
      margin: "0 0",
    }} />
  );
}

function SicTag() {
  return <span style={{ fontSize: 11, fontWeight: 700, border: "1px solid #9ca3af", borderRadius: 4, padding: "2px 8px", color: "#374151", letterSpacing: 1, background: "#fff", flexShrink: 0 }}>SIC</span>;
}

function PrivateTag() {
  return <span style={{ fontSize: 11, fontWeight: 700, border: "1px solid #2563eb", borderRadius: 4, padding: "2px 7px", color: "#2563eb", letterSpacing: 1, background: "#eff6ff" }}>PRIVATE</span>;
}

function DayRow({
  day, date, open, onToggle, children,
}: {
  day: number; date: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "14px 0" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        onClick={onToggle}
      >
        <div style={{ width: 3, height: 40, background: "#1e3a5f", borderRadius: 2, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
            Day {day}: {date}
          </div>
        </div>
        <span style={{ color: "#9ca3af", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div style={{ paddingLeft: 13, borderLeft: "3px solid #f3f4f6", marginLeft: 1, marginTop: 12 }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Styles ── */

const s: Record<string, React.CSSProperties> = {
  page: {
    background: "#ffffff",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    color: "#111827",
    maxWidth: 900,
    margin: "0 auto",
    boxShadow: "0 0 50px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    borderBottom: "1px solid #f3f4f6",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 16 },
  logoBox: {
    width: 60,
    height: 60,
    border: "1.5px solid #1e3a5f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    flexShrink: 0,
    padding: 6,
    overflow: 'hidden'
  },
  logoText: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: "center",
    whiteSpace: "pre",
    lineHeight: 1.2,
    color: "#1e3a5f",
  },
  agencyName: { fontWeight: 700, fontSize: 18, color: "#1e3a5f", fontFamily: "'Playfair Display', serif" },
  agencyAddr: { fontSize: 12, color: "#6b7280", lineHeight: 1.4 },
  headerRight: { textAlign: "right" },
  contactLine: { fontSize: 13, color: "#1e3a5f", marginBottom: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 },

  heroWrap: { position: "relative", height: 400, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  heroGradient: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
  },
  heroBadge: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    padding: "32px",
  },
  heroTag: {
    display: "inline-block", background: "rgba(255,255,255,0.2)",
    backdropFilter: 'blur(4px)', color: "#fff",
    fontSize: 10, fontWeight: 700, letterSpacing: 2,
    padding: "4px 12px", borderRadius: 4, marginBottom: 12,
  },
  heroTitle: { 
    margin: "0 0 8px", fontSize: 42, fontWeight: 700, color: "#fff", 
    fontFamily: "'Playfair Display', serif", textShadow: '0 2px 10px rgba(0,0,0,0.3)' 
  },
  heroMeta: { fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: 16, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 },
  heroIcons: { display: "flex", gap: 16 },
  heroIconChip: { fontSize: 12, color: "rgba(255,255,255,0.8)", display: 'flex', alignItems: 'center', gap: 4 },
  
  heroRight: { textAlign: "right", color: '#fff' },
  heroPriceLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 2 },
  heroPrice: { fontSize: 32, fontWeight: 700, color: "#facc15", marginBottom: 4 },
  heroQuery: { fontSize: 11, color: "rgba(255,255,255,0.6)" },

  body: { padding: "32px 32px 0" },

  guestRow: { display: "flex", alignItems: "center", gap: 10 },
  guestAvatar: { fontSize: 20 },
  guestName: { fontSize: 15, color: "#374151", fontWeight: 600 },

  hotelCardSmall: {
    display: "flex", gap: 12, background: "#f9fafb",
    border: "1px solid #f3f4f6", borderRadius: 12, overflow: "hidden",
  },
  hotelImgSmall: { width: 100, height: 100, objectFit: "cover", flexShrink: 0 },
  hotelInfoSmall: { padding: "12px", flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  hotelNameSmall: { fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 },
  hotelLocSmall: { fontSize: 11, color: "#6b7280", display: 'flex', alignItems: 'center', gap: 4 },

  eventBox: {
    padding: "16px", background: "#fff", border: "1px solid #f3f4f6",
    borderRadius: 12, marginBottom: 12, position: 'relative'
  },
  categoryTag: {
    fontSize: 10, fontWeight: 700, color: "#1e3a5f", 
    background: "#eff6ff", padding: "2px 8px", borderRadius: 4, textTransform: 'uppercase'
  },
  eventTitle: { fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 6 },
  eventImg: { width: 80, height: 80, objectFit: "cover", borderRadius: 8, marginLeft: 16 },
  highlightChip: {
    fontSize: 11, fontWeight: 600, color: "#059669", 
    background: "#ecfdf5", padding: "2px 10px", borderRadius: 20
  },

  daySubTitle: {
    fontSize: 15, fontWeight: 700, color: "#111827",
    marginBottom: 12, fontFamily: "'Playfair Display', serif"
  },
  dayDesc: { fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: "0 0 12px" },
  
  transferGrid: { display: "flex", alignItems: "center", gap: 10, marginTop: 12 },
  transferCell: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#f9fafb", padding: "8px 12px", borderRadius: 8, fontSize: 12, flex: 1
  },
  transferIcon: { fontSize: 14 },
  arrow: { color: "#9ca3af" },

  onTripBannerPremium: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #111827 100%)",
    borderRadius: 16, padding: "32px",
    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24,
    color: '#fff', boxShadow: '0 10px 30px rgba(30,58,95,0.3)'
  },
  onTripLogo: { fontSize: 14, fontWeight: 800, color: "#facc15", marginBottom: 12, letterSpacing: 2 },
  onTripTitleLarge: { 
    fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, 
    marginBottom: 12, fontFamily: "'Playfair Display', serif" 
  },
  storeBtn: {
    fontSize: 12, fontWeight: 700, background: "#fff", color: "#111827",
    borderRadius: 8, padding: "10px 20px", cursor: "pointer",
  },
  qrPlaceholder: {
    width: 100, height: 100, border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
  },

  footerFeedback: {
    padding: "24px 0", textAlign: 'center', borderTop: '1px solid #f3f4f6',
    fontSize: 13, color: "#6b7280", marginTop: 32
  },
  thankYouPremium: {
    background: "#1e3a5f", color: "#fff", textAlign: "center",
    padding: "20px 0", fontWeight: 700, fontSize: 12, letterSpacing: 4,
  },
  socialFooter: {
    background: "#f9fafb",
    padding: "40px 32px",
    borderTop: "1px solid #f3f4f6",
  },
  socialContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  socialBrand: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e3a5f",
    fontFamily: "'Playfair Display', serif",
  },
  socialIcons: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  socialIcon: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#fff",
    border: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e3a5f",
    transition: "all 0.2s ease",
    textDecoration: "none",
  },
  socialCopyright: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },
};

const globalCss = `
  * { box-sizing: border-box; } 
  body { margin: 0; }
  @media print {
    .no-print { display: none !important; }
    body { background: white !important; }
  }
  a:hover { opacity: 0.8; }
`;
