import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../api/rooms.api";
import {
  Users,
  Wifi,
  Car,
  Utensils,
  Shield,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=80";
const AMENITY_IMAGE =
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80";
const LOBBY_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80";

const roomTypeLabels = { single: "Single", double: "Double", suite: "Suite" };

const amenities = [
  { icon: Wifi, label: "High-Speed WiFi", desc: "Complimentary in all rooms" },
  { icon: Utensils, label: "Fine Dining", desc: "World-class cuisine on-site" },
  { icon: Car, label: "Valet Parking", desc: "Secure parking available" },
  { icon: Shield, label: "24/7 Security", desc: "Your safety, our priority" },
];

const testimonials = [
  {
    name: "Amina Ochieng",
    role: "Business Traveller",
    text: "An unforgettable stay. The suite was immaculate and the staff went above and beyond at every turn.",
    rating: 5,
    avatar: "AO",
  },
  {
    name: "David Kamau",
    role: "Leisure Guest",
    text: "Fahari Grand exceeded every expectation. The attention to detail is remarkable — I will be back.",
    rating: 5,
    avatar: "DK",
  },
  {
    name: "Sarah Njeri",
    role: "Honeymoon Guest",
    text: "We chose Fahari Grand for our honeymoon and it was absolutely perfect. Truly magnificent.",
    rating: 5,
    avatar: "SN",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <span className="text-amber-400 font-bold text-lg tracking-wide">
              Fahari Grand
            </span>
            <span className="text-slate-500 text-xs ml-2 italic hidden sm:inline">
              Hotel & Suites
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => document.getElementById("rooms").scrollIntoView({ behavior: "smooth" })}
              className="text-slate-400 hover:text-white text-sm transition px-3"
            >
              Rooms
            </button>
            <button
              onClick={() => document.getElementById("amenities").scrollIntoView({ behavior: "smooth" })}
              className="text-slate-400 hover:text-white text-sm transition px-3"
            >
              Amenities
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-slate-300 hover:text-white text-sm transition px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-amber-400 text-slate-900 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-amber-300 transition"
            >
              Book Now
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden text-slate-400 hover:text-white transition"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden bg-slate-900 border-t border-slate-800 px-6 py-4 space-y-3">
            <button onClick={() => { document.getElementById("rooms").scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }} className="block text-slate-300 text-sm w-full text-left py-2">Rooms</button>
            <button onClick={() => { document.getElementById("amenities").scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); }} className="block text-slate-300 text-sm w-full text-left py-2">Amenities</button>
            <button onClick={() => navigate("/login")} className="block text-slate-300 text-sm w-full text-left py-2">Sign In</button>
            <button onClick={() => navigate("/register")} className="block w-full bg-amber-400 text-slate-900 font-semibold py-2.5 rounded-lg text-sm">Book Now</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={HERO_IMAGE}
          alt="Fahari Grand Hotel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/65" />
        {/* Gold gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">
              Nairobi's Premier Destination
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 drop-shadow-lg">
            Where{" "}
            <span className="text-amber-400 italic font-light">
              magnificence
            </span>
            <br />
            lives.
          </h1>

          <p className="text-slate-300 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed drop-shadow">
            Experience unrivalled luxury at Fahari Grand Hotel & Suites —
            where every detail is crafted for your comfort.
          </p>

          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-amber-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:bg-amber-300 transition text-base flex items-center justify-center gap-2"
            >
              Reserve Your Room
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById("rooms").scrollIntoView({ behavior: "smooth" })}
              className="border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:border-amber-400 hover:text-amber-400 transition text-base backdrop-blur-sm"
            >
              View Rooms
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-amber-400 animate-pulse" />
          <span className="text-xs text-slate-400 tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-slate-800 bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "50+", label: "Luxury Rooms" },
            { value: "3", label: "Room Categories" },
            { value: "24/7", label: "Concierge Service" },
            { value: "100%", label: "Guest Satisfaction" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-amber-400 font-bold text-3xl">{value}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About split section ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase">
              About Fahari Grand
            </p>
            <h2 className="text-4xl font-bold leading-tight">
              Luxury redefined in the heart of Nairobi
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Fahari Grand Hotel & Suites stands as a beacon of excellence in
              Nairobi's hospitality landscape. From our meticulously appointed
              rooms to our world-class dining, every element is designed to
              create moments that last a lifetime.
            </p>
            <p className="text-slate-400 leading-relaxed">
              Our dedicated team of professionals is committed to delivering
              personalised service that anticipates your every need — because
              you deserve nothing less than extraordinary.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 text-amber-400 font-semibold hover:underline text-sm"
            >
              Start your journey <ChevronRight size={16} />
            </button>
          </div>
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden">
            <img
              src={LOBBY_IMAGE}
              alt="Fahari Grand Lobby"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
            <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-sm border border-amber-400/20 rounded-xl px-4 py-3">
              <p className="text-amber-400 font-bold text-lg">Est. 2024</p>
              <p className="text-slate-400 text-xs">Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rooms Showcase ── */}
      <section id="rooms" className="py-24 px-6 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
              Accommodations
            </p>
            <h2 className="text-4xl font-bold text-white">Rooms & Suites</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto">
              Each room is designed to offer the perfect balance of comfort,
              style, and modern convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length > 0
              ? rooms.map((room) => (
                  <div
                    key={room.id}
                    className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/40 transition-all hover:shadow-xl hover:shadow-amber-400/5"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-800">
                      {room.image ? (
                        <img
                          src={`${CLOUDINARY_BASE}${room.image}`}
                          alt={`Room ${room.room_number}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src={`https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80`}
                          alt="Hotel Room"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                      <span className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow">
                        Room {room.room_number}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-slate-400 text-sm capitalize">
                          {roomTypeLabels[room.room_type] || room.room_type} · Floor {room.floor}
                        </p>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold">
                            KES {parseFloat(room.price_per_night).toLocaleString()}
                          </span>
                          <span className="text-slate-500 text-xs"> /night</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Users size={12} />
                        <span>Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""}</span>
                      </div>
                      {room.description && (
                        <p className="text-slate-500 text-xs line-clamp-2">{room.description}</p>
                      )}
                      <button
                        onClick={() => navigate("/register")}
                        className="w-full py-2 rounded-lg text-sm font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400 hover:text-slate-900 transition"
                      >
                        Book This Room
                      </button>
                    </div>
                  </div>
                ))
              : ["Single Room", "Double Room", "Suite"].map((type, i) => (
                  <div key={type} className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/40 transition-all">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-${["1631049307264-da0ec9d70304", "1618773928121-c32242e63f39", "1582719508461-905c673771fd"][i]}?w=600&q=80`}
                        alt={type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                      <span className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow">{type}</span>
                    </div>
                    <div className="p-5">
                      <p className="text-slate-400 text-sm mb-3">Elegant, well-appointed rooms with all modern amenities.</p>
                      <button
                        onClick={() => navigate("/register")}
                        className="w-full py-2 rounded-lg text-sm font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400 hover:text-slate-900 transition"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate("/login")}
              className="border border-slate-700 text-slate-300 px-6 py-2.5 rounded-xl hover:border-amber-400 hover:text-amber-400 transition text-sm font-semibold"
            >
              View All Rooms →
            </button>
          </div>
        </div>
      </section>

      {/* ── Amenities ── */}
      <section id="amenities" className="relative py-24 px-6 overflow-hidden">
        <img
          src={AMENITY_IMAGE}
          alt="Hotel amenities"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-slate-950/80" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
              What We Offer
            </p>
            <h2 className="text-4xl font-bold text-white">A Cut Above the Rest</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 space-y-3 hover:border-amber-400/30 transition"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                  <Icon size={20} className="text-amber-400" />
                </div>
                <p className="text-white font-semibold">{label}</p>
                <p className="text-slate-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
              Guest Reviews
            </p>
            <h2 className="text-4xl font-bold text-white">What Our Guests Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating, avatar }) => (
              <div
                key={name}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4 hover:border-amber-400/30 transition"
              >
                <div className="flex gap-1">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{text}"
                </p>
                <div className="border-t border-slate-800 pt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&q=80"
          alt="Hotel pool"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/75" />
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-white">
            Ready for an <span className="text-amber-400 italic font-light">Unforgettable</span> Stay?
          </h2>
          <p className="text-slate-300 text-lg">
            Reserve your room today and experience the Fahari Grand difference.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-amber-400 text-slate-900 font-bold px-10 py-4 rounded-xl hover:bg-amber-300 transition text-base inline-flex items-center gap-2"
          >
            Book Your Stay
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 bg-slate-900/80">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="space-y-4">
            <p className="text-amber-400 font-bold text-xl">Fahari Grand</p>
            <p className="text-slate-400 text-sm italic">Where magnificence lives.</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              Nairobi's premier luxury hotel, offering world-class
              accommodation and unparalleled service.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">Quick Links</p>
            <div className="space-y-2">
              {[
                { label: "Browse Rooms", action: () => document.getElementById("rooms").scrollIntoView({ behavior: "smooth" }) },
                { label: "Book a Room", action: () => navigate("/register") },
                { label: "Sign In", action: () => navigate("/login") },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="block text-slate-400 hover:text-amber-400 text-sm transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-white font-semibold text-sm uppercase tracking-wide">Contact Us</p>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <MapPin size={14} className="text-amber-400 shrink-0" />
                Nairobi, Kenya
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Phone size={14} className="text-amber-400 shrink-0" />
                +254 700 000 000
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Mail size={14} className="text-amber-400 shrink-0" />
                info@faharigrand.co.ke
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 px-6 py-5">
          <p className="text-center text-slate-600 text-xs">
            © {new Date().getFullYear()} Fahari Grand Hotel & Suites. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;