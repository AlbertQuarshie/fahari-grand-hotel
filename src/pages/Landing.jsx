import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRooms } from "../api/rooms.api";
import { getApprovedReviews } from "../api/reviews.api";
import { sendContactMessage } from "../api/contact.api";
import { usePageTitle } from "../hooks/usePageTitle";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import {
  Wifi, UtensilsCrossed, Car, ShieldCheck,
  MapPin, Phone, Mail, Clock, Star, Users, Building2, Award,
} from "lucide-react";
import {
  display, body, sectionLabel,
  card, cardHover, input,
  btnPrimary, btnNavy, btnOutline,
  skeleton,
} from "../constants/theme";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const roomTypeLabels = { single: "Single", double: "Double", suite: "Suite" };

const today = new Date().toISOString().split("T")[0];

const signatureSuiteImages = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80",
  "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=900&q=80",
];

const amenities = [
  { icon: Wifi,            label: "High-Speed WiFi",  desc: "Complimentary, every room" },
  { icon: UtensilsCrossed, label: "Fine Dining",       desc: "On-site restaurant & bar" },
  { icon: Car,             label: "Valet Parking",     desc: "Secure, attended around the clock" },
  { icon: ShieldCheck,     label: "24/7 Security",     desc: "Always watching, never intrusive" },
];

const stats = [
  { icon: Building2, value: "150+", label: "Rooms & Suites" },
  { icon: Star,      value: "4.9★", label: "Average Rating" },
  { icon: Users,     value: "12K+", label: "Guests Hosted" },
  { icon: Award,     label: "Est. 2019", value: "5 Years",  },
];

const whyUs = [
  {
    title: "Crafted for the Discerning Traveller",
    body:
      "Every room is designed with purpose — premium linens, blackout curtains, artisan toiletries, and soundproofed walls that turn your stay into genuine rest.",
  },
  {
    title: "Nairobi at Your Fingertips",
    body:
      "Minutes from Westlands, Upper Hill, and the CBD. Our concierge team arranges airport transfers, city tours, and restaurant bookings at a moment's notice.",
  },
  {
    title: "Service Without a Script",
    body:
      "Our staff don't follow tick-boxes. They remember how you take your coffee, your preferred pillow firmness, and ensure every return visit feels like coming home.",
  },
];

const testimonials = [
  {
    name: "Amina Ochieng",
    role: "Business Traveller",
    text: "An unforgettable stay. The suite was immaculate and the staff went above and beyond at every turn.",
    avatar: "AO",
    rating: 5,
  },
  {
    name: "David Kamau",
    role: "Leisure Guest",
    text: "Fahari Grand exceeded every expectation. The attention to detail is remarkable — I will be back.",
    avatar: "DK",
    rating: 5,
  },
  {
    name: "Sarah Njeri",
    role: "Honeymoon Guest",
    text: "We chose Fahari Grand for our honeymoon and it was absolutely perfect. Truly magnificent.",
    avatar: "SN",
    rating: 5,
  },
];

const Landing = () => {
  usePageTitle();
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState(null);
  const [displayedReviews, setDisplayedReviews] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeReview, setActiveReview] = useState(0);
  const [activeSuiteImage, setActiveSuiteImage] = useState(0);

  const [searchCheckIn, setSearchCheckIn] = useState("");
  const [searchCheckOut, setSearchCheckOut] = useState("");

  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSuiteImage((prev) => (prev + 1) % signatureSuiteImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Support arriving from another page's nav link, e.g. /#rooms
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [location.hash]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data.slice(0, 3));
      } catch {
        // fail silently
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getApprovedReviews();
        if (data && data.length > 0) {
          setReviews(data);
          setDisplayedReviews(data.slice(0, 3));
        } else {
          setReviews(testimonials);
          setDisplayedReviews(testimonials);
        }
      } catch {
        setReviews(testimonials);
        setDisplayedReviews(testimonials);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleViewMore = () => { setShowAllReviews(true); setDisplayedReviews(reviews); };
  const handleViewLess = () => { setShowAllReviews(false); setDisplayedReviews(reviews.slice(0, 3)); setActiveReview(0); };

  const handleAvailabilitySearch = (e) => {
    e.preventDefault();
    if (!searchCheckIn || !searchCheckOut) {
      toast.error("Please select both check-in and check-out dates.");
      return;
    }
    navigate(`/guest/rooms?checkIn=${searchCheckIn}&checkOut=${searchCheckOut}`);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      await sendContactMessage(contactForm);
      toast.success("Message sent — we'll get back to you shortly.");
      setContactForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Couldn't send your message. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white ${body}`}>
      <Navbar />

      <div className="pt-16">

        {/* ── Hero ── */}
        <section className="relative h-[680px] flex items-center px-6 overflow-hidden bg-[#0B1F3A]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3A] via-[#0B1F3A]/85 to-[#0B1F3A]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-transparent" />

          <div className="relative max-w-6xl mx-auto w-full">
            <div className="max-w-xl space-y-6 border-l-2 border-[#C9A24B] pl-8">
              <p className={`${sectionLabel} !text-[#C9A24B]`}>Nairobi, Kenya</p>
              <h1 className={`${display} text-5xl md:text-6xl font-bold text-white leading-[1.05]`}>
                Fahari Grand<br />Hotel &amp; Suites
              </h1>
              <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-md">
                Where magnificence lives — considered rooms, attentive service,
                and a quiet sense of occasion from the moment you arrive.
              </p>
              <div className="flex items-center gap-4 pt-2 flex-wrap">
                <button onClick={() => navigate("/guest/rooms")} className={`${btnPrimary} px-8 py-3 rounded`}>
                  Browse Rooms
                </button>
                <button onClick={() => scrollTo("why-us")} className="text-white/80 hover:text-[#C9A24B] text-sm font-semibold transition underline-offset-4 hover:underline">
                  Discover the experience →
                </button>
              </div>
            </div>

            {/* Availability search */}
            <form
              onSubmit={handleAvailabilitySearch}
              className="mt-10 bg-white rounded-lg shadow-2xl p-5 sm:p-6 max-w-3xl grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 sm:items-end"
            >
              <div>
                <label className="block text-[#0B1F3A] text-xs font-bold mb-1">Check-in</label>
                <input
                  type="date"
                  min={today}
                  value={searchCheckIn}
                  onChange={(e) => {
                    setSearchCheckIn(e.target.value);
                    if (searchCheckOut && e.target.value >= searchCheckOut) setSearchCheckOut("");
                  }}
                  className={input}
                  required
                />
              </div>
              <div>
                <label className="block text-[#0B1F3A] text-xs font-bold mb-1">Check-out</label>
                <input
                  type="date"
                  min={searchCheckIn || today}
                  value={searchCheckOut}
                  onChange={(e) => setSearchCheckOut(e.target.value)}
                  className={input}
                  required
                />
              </div>
              <button type="submit" className={`${btnPrimary} px-8 py-2.5 rounded h-[42px] whitespace-nowrap`}>
                Check Availability
              </button>
            </form>
          </div>
        </section>

        {/* ── Stats trust bar ── */}
        <section className="bg-[#C9A24B]">
          <div className="max-w-6xl mx-auto px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={20} className="text-[#0B1F3A] shrink-0" />
                <div>
                  <p className={`${display} text-[#0B1F3A] font-bold text-lg leading-none`}>{value}</p>
                  <p className="text-[#0B1F3A]/70 text-xs font-semibold mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Amenities strip ── */}
        <section className="bg-[#0B1F3A] border-t border-[#C9A24B]/10">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {amenities.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={18} className="text-[#C9A24B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-white text-sm font-bold leading-tight">{label}</p>
                  <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why Fahari Grand ── */}
        <section id="why-us" className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Left: image */}
              <div className="relative">
                <div className="relative h-[480px] rounded overflow-hidden shadow-2xl">
                  {signatureSuiteImages.map((src, index) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Fahari Grand suite interior - view ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        index === activeSuiteImage ? "opacity-100" : "opacity-0"
                      }`}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/60 to-transparent" />
                  <div className="absolute top-6 right-6 flex gap-1.5 z-10">
                    {signatureSuiteImages.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === activeSuiteImage ? "w-5 bg-[#C9A24B]" : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-[#0B1F3A]/90 border border-[#C9A24B]/30 rounded px-5 py-4">
                      <p className={`${display} text-white text-sm font-bold`}>Signature Suite</p>
                      <p className="text-[#C9A24B] text-xs mt-1">From KES 25,000 / night</p>
                    </div>
                  </div>
                </div>
                {/* Gold accent block */}
                <div className="absolute -bottom-5 -right-5 w-28 h-28 bg-[#C9A24B]/15 rounded -z-10" />
                <div className="absolute -top-5 -left-5 w-16 h-16 bg-[#0B1F3A]/10 rounded -z-10" />
              </div>

              {/* Right: pillars */}
              <div className="space-y-4">
                <p className={`${sectionLabel} mb-4`}>The Fahari Difference</p>
                <h2 className={`${display} text-4xl font-bold text-[#0B1F3A] leading-snug mb-8`}>
                  More Than a Stay.<br />An Experience.
                </h2>
                <div className="space-y-8">
                  {whyUs.map(({ title, body: text }, i) => (
                    <div key={title} className="flex gap-5">
                      <div className="shrink-0 w-10 h-10 rounded bg-[#C9A24B]/10 border border-[#C9A24B]/30 flex items-center justify-center">
                        <span className={`${display} text-[#C9A24B] font-bold text-sm`}>0{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-[#0B1F3A] font-bold text-sm mb-1">{title}</p>
                        <p className="text-[#0B1F3A]/60 text-sm leading-relaxed">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6">
                  <button onClick={() => navigate("/register")} className={`${btnNavy} px-8 py-3 rounded text-sm`}>
                    Reserve Your Room
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Available Rooms ── */}
        <section id="rooms" className="py-24 px-6 bg-[#FAF8F3]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
              <div>
                <p className={`${sectionLabel} mb-3`}>Accommodation</p>
                <h2 className={`${display} text-4xl font-bold text-[#0B1F3A]`}>Featured Rooms</h2>
                <p className="text-[#0B1F3A]/50 text-sm mt-2">A curated selection from our collection</p>
              </div>
              <button
                onClick={() => navigate("/guest/rooms")}
                className={`hidden sm:inline-flex ${btnOutline} px-6 py-2.5 rounded text-sm`}
              >
                View All Rooms
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`${cardHover} overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg`}
                  onClick={() => navigate(`/guest/rooms/${room.id}`)}
                >
                  <div className="relative h-52 overflow-hidden bg-[#0B1F3A]/10">
                    {room.image ? (
                      <img
                        src={`${CLOUDINARY_BASE}${room.image}`}
                        alt={`Room ${room.room_number}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className={`${display} text-[#0B1F3A]/40 font-bold`}>Room {room.room_number}</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#0B1F3A]/90 text-[#C9A24B] text-xs font-bold px-2.5 py-1 tracking-wide rounded">
                      {roomTypeLabels[room.room_type]}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-[#0B1F3A] font-bold text-sm">Room {room.room_number} · Floor {room.floor}</p>
                    <p className="text-[#0B1F3A]/70 text-sm leading-relaxed line-clamp-2">{room.description}</p>
                    <div className="flex justify-between items-baseline pt-3 border-t border-[#0B1F3A]/10">
                      <p className={`${display} text-[#0B1F3A] font-bold text-lg`}>
                        KES {parseFloat(room.price_per_night).toLocaleString()}
                      </p>
                      <p className="text-[#0B1F3A]/50 text-xs">per night</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center sm:hidden">
              <button onClick={() => navigate("/guest/rooms")} className={`${btnOutline} px-6 py-2.5 rounded text-sm`}>
                View All Rooms
              </button>
            </div>
          </div>
        </section>

        {/* ── Testimonials / Guest Book ── */}
        <section id="testimonials" className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className={`${sectionLabel} mb-3`}>The Guest Book</p>
              <h2 className={`${display} text-4xl font-bold text-[#0B1F3A]`}>What Our Guests Say</h2>
              <p className="text-[#0B1F3A]/60 text-sm mt-2">
                {reviews && reviews.length > 0
                  ? `${reviews.length} verified stays, in their own words`
                  : "Read what our guests love about us"}
              </p>
            </div>

            {loading ? (
              <div className={`h-64 ${skeleton}`} />
            ) : displayedReviews && displayedReviews.length > 0 ? (
              <>
                <div className={`relative ${card} px-10 py-12 sm:px-16 sm:py-14 mb-10 bg-[#FAF8F3]`}>
                  <span className={`${display} absolute top-2 left-6 text-[#C9A24B]/30 text-7xl select-none`}>&ldquo;</span>
                  <div className="relative space-y-6 text-center max-w-2xl mx-auto">
                    <div className="flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < (displayedReviews[activeReview]?.rating || 5) ? "text-[#C9A24B]" : "text-[#0B1F3A]/15"}`}>★</span>
                      ))}
                    </div>
                    <p className={`${display} text-[#0B1F3A] text-xl sm:text-2xl leading-relaxed italic`}>
                      {displayedReviews[activeReview]?.text || displayedReviews[activeReview]?.comment || "Great stay!"}
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <div className="w-10 h-10 rounded-full bg-[#0B1F3A] flex items-center justify-center text-[#C9A24B] font-bold text-sm">
                        {displayedReviews[activeReview]?.avatar ||
                          (displayedReviews[activeReview]?.guest_name || displayedReviews[activeReview]?.name)
                            ?.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="text-left">
                        <p className="text-[#0B1F3A] font-bold text-sm">
                          {displayedReviews[activeReview]?.name || displayedReviews[activeReview]?.guest_name || "Guest"}
                        </p>
                        <p className="text-[#0B1F3A]/50 text-xs">
                          {displayedReviews[activeReview]?.role ||
                            (displayedReviews[activeReview]?.room_number
                              ? `Room ${displayedReviews[activeReview]?.room_number}`
                              : "Verified guest")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {displayedReviews.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      onClick={() => setActiveReview(idx)}
                      className={`text-left p-4 rounded border transition ${
                        idx === activeReview
                          ? "border-[#C9A24B] bg-[#C9A24B]/5"
                          : "border-[#0B1F3A]/10 hover:border-[#0B1F3A]/30"
                      }`}
                    >
                      <p className="text-[#0B1F3A] text-sm leading-snug line-clamp-2 font-semibold">
                        {item.text || item.comment || "Great stay!"}
                      </p>
                      <p className="text-[#0B1F3A]/50 text-xs mt-2 font-bold">
                        — {item.name || item.guest_name || "Guest"}
                      </p>
                    </button>
                  ))}
                </div>

                {reviews && reviews.length > 3 && (
                  <div className="text-center mt-10">
                    <button onClick={showAllReviews ? handleViewLess : handleViewMore} className={`${btnOutline} px-8 py-3 rounded text-sm`}>
                      {showAllReviews ? "Show Fewer Reviews" : "View More Reviews"}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </section>

        {/* ── Contact Us ── */}
        <section id="contact" className="py-24 px-6 bg-[#FAF8F3]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className={`${sectionLabel} mb-3`}>Get In Touch</p>
              <h2 className={`${display} text-4xl font-bold text-[#0B1F3A]`}>Contact Us</h2>
              <p className="text-[#0B1F3A]/60 text-sm mt-2 max-w-md mx-auto">
                Questions about a stay, a group booking, or anything else — we&apos;d love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* Info column */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`${card} p-6 space-y-5`}>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-[#C9A24B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[#0B1F3A] font-bold text-sm">Address</p>
                      <p className="text-[#0B1F3A]/60 text-sm mt-0.5">Westlands, Nairobi, Kenya</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-[#C9A24B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[#0B1F3A] font-bold text-sm">Phone</p>
                      <p className="text-[#0B1F3A]/60 text-sm mt-0.5">+254 712 345 678</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-[#C9A24B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[#0B1F3A] font-bold text-sm">Email</p>
                      <p className="text-[#0B1F3A]/60 text-sm mt-0.5">faharigrandhotel@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[#C9A24B] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[#0B1F3A] font-bold text-sm">Reception</p>
                      <p className="text-[#0B1F3A]/60 text-sm mt-0.5">Open 24 / 7</p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="rounded overflow-hidden border border-[#0B1F3A]/10 h-56">
                  <iframe
                    title="Fahari Grand Hotel location"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps?q=Westlands,Nairobi,Kenya&output=embed"
                  />
                </div>
              </div>

              {/* Form column */}
              <div className="lg:col-span-3">
                <form onSubmit={handleContactSubmit} className={`${card} p-6 sm:p-8 space-y-4`}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#0B1F3A] text-xs font-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className={input}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#0B1F3A] text-xs font-bold mb-1">Email</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className={input}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#0B1F3A] text-xs font-bold mb-1">Phone (optional)</label>
                      <input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className={input}
                      />
                    </div>
                    <div>
                      <label className="block text-[#0B1F3A] text-xs font-bold mb-1">Subject</label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className={input}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#0B1F3A] text-xs font-bold mb-1">Message</label>
                    <textarea
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className={`${input} resize-none`}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactSubmitting}
                    className={`${btnNavy} px-8 py-3 rounded text-sm disabled:opacity-50`}
                  >
                    {contactSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing CTA band ── */}
        <section className="bg-[#0B1F3A] py-20 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=1200&q=60')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative max-w-2xl mx-auto">
            <p className={`${sectionLabel} !text-[#C9A24B] mb-4`}>Ready to Experience Fahari?</p>
            <p className={`${display} text-white text-3xl sm:text-4xl font-bold mb-4 leading-snug`}>
              Your stay begins with<br />a single booking.
            </p>
            <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
              Join thousands of guests who've made Fahari Grand their home away from home in Nairobi.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={() => navigate("/guest/rooms")} className={`${btnPrimary} px-8 py-3 rounded`}>
                Browse Rooms
              </button>
              <button onClick={() => navigate("/register")} className="border-2 border-white/30 text-white font-bold px-8 py-3 rounded hover:border-[#C9A24B] hover:text-[#C9A24B] transition text-sm">
                Create Account
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-[#0B1F3A] border-t border-[#C9A24B]/15 text-white">
          <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">

            {/* Brand */}
            <div className="space-y-4">
              <div>
                <p className={`${display} text-white font-bold text-xl`}>Fahari Grand</p>
                <p className="text-[#C9A24B] text-xs italic mt-0.5">Hotel &amp; Suites</p>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                A boutique luxury hotel in the heart of Nairobi, dedicated to unmatched hospitality and refined comfort.
              </p>
              <p className={`${display} text-[#C9A24B] text-sm italic`}>"Where magnificence lives."</p>
            </div>

            {/* Quick Links */}
            <div>
              <p className={`${sectionLabel} !text-[#C9A24B] mb-5`}>Quick Links</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Browse Rooms",  action: () => navigate("/guest/rooms") },
                  { label: "Book a Stay",   action: () => navigate("/register") },
                  { label: "Sign In",       action: () => navigate("/login") },
                  { label: "Our Amenities", action: () => scrollTo("why-us") },
                  { label: "Guest Reviews", action: () => scrollTo("testimonials") },
                ].map(({ label, action }) => (
                  <li key={label}>
                    <button onClick={action} className="text-white/60 text-sm hover:text-[#C9A24B] transition font-semibold">
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className={`${sectionLabel} !text-[#C9A24B] mb-5`}>Contact Us</p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin size={15} className="text-[#C9A24B] mt-0.5 shrink-0" />
                  <span className="text-white/60 text-sm">Westlands, Nairobi,<br />Kenya</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={15} className="text-[#C9A24B] shrink-0" />
                  <span className="text-white/60 text-sm">+254 712 345 678</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={15} className="text-[#C9A24B] shrink-0" />
                  <span className="text-white/60 text-sm">faharigrandhotel@gmail.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Clock size={15} className="text-[#C9A24B] shrink-0" />
                  <span className="text-white/60 text-sm">Reception: 24 / 7</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#C9A24B]/10 px-6 py-5">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
              <p className="text-white/40 text-xs">
                © {new Date().getFullYear()} Fahari Grand Hotel &amp; Suites. All rights reserved.
              </p>
              <p className="text-white/30 text-xs">Built with care · Nairobi, Kenya</p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Landing;