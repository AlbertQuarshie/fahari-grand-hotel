import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRooms } from "../api/rooms.api";
import { Menu, X } from "lucide-react";
import { display, body } from "../constants/theme";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dmtfy0fnm/";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=80";
const AMENITY_IMAGE =
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80";
const LOBBY_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80";

const roomTypeLabels = { single: "Single", double: "Double", suite: "Suite" };

const amenities = [
  { label: "High-Speed WiFi", desc: "Complimentary in all rooms" },
  { label: "Fine Dining", desc: "World-class cuisine on-site" },
  { label: "Valet Parking", desc: "Secure parking available" },
  { label: "24/7 Security", desc: "Your safety, our priority" },
];

const testimonials = [
  {
    name: "Amina Ochieng",
    role: "Business Traveller",
    text: "An unforgettable stay. The suite was immaculate and the staff went above and beyond at every turn.",
    avatar: "AO",
  },
  {
    name: "David Kamau",
    role: "Leisure Guest",
    text: "Fahari Grand exceeded every expectation. The attention to detail is remarkable — I will be back.",
    avatar: "DK",
  },
  {
    name: "Sarah Njeri",
    role: "Honeymoon Guest",
    text: "We chose Fahari Grand for our honeymoon and it was absolutely perfect. Truly magnificent.",
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

  const scrollTo = (id) =>
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });

  return (
    <div className={`min-h-screen bg-white ${body}`}>
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B1F3A] border-b border-[#C9A24B]/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`${display} text-white font-bold text-lg tracking-wide`}>
              Fahari Grand
            </span>
            <span className="text-[#C9A24B] text-xs italic hidden sm:inline">
              Hotel &amp; Suites
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollTo("rooms")}
              className="text-white hover:text-[#C9A24B] text-sm font-semibold transition px-3 py-1.5"
            >
              Rooms
            </button>
            <button
              onClick={() => scrollTo("amenities")}
              className="text-white hover:text-[#C9A24B] text-sm font-semibold transition px-3 py-1.5"
            >
              Amenities
            </button>
            <button
              onClick={() => navigate("/login")}
              className="text-white hover:text-[#C9A24B] text-sm font-semibold transition px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-[#C9A24B] text-[#0B1F3A] text-sm font-bold px-5 py-2 rounded hover:bg-white transition"
            >
              Book Now
            </button>
          </div>

          {/* Mobile hamburger — functional icon, kept */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden text-white hover:text-[#C9A24B] transition"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden bg-[#0B1F3A] border-t border-[#C9A24B]/20 px-6 py-4 space-y-1">
            <button
              onClick={() => { scrollTo("rooms"); setMenuOpen(false); }}
              className="block text-white text-sm font-semibold w-full text-left py-2.5"
            >
              Rooms
            </button>
            <button
              onClick={() => { scrollTo("amenities"); setMenuOpen(false); }}
              className="block text-white text-sm font-semibold w-full text-left py-2.5"
            >
              Amenities
            </button>
            <button
              onClick={() => navigate("/login")}
              className="block text-white text-sm font-semibold w-full text-left py-2.5"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="block w-full bg-[#C9A24B] text-[#0B1F3A] font-bold py-3 rounded text-sm mt-2"
            >
              Book Now
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Fahari Grand Hotel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Navy overlay for max text contrast over the photo */}
        <div className="absolute inset-0 bg-[#0B1F3A]/70" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0B1F3A] to-transparent" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-16">
          <p className="text-[#C9A24B] text-xs font-bold tracking-[0.2em] uppercase mb-8">
            Nairobi&rsquo;s Premier Destination
          </p>

          <h1 className={`${display} text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white`}>
            Where magnificence
            <br />
            <span className="text-[#C9A24B] italic">lives.</span>
          </h1>

          <p className="text-white text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Experience unrivalled luxury at Fahari Grand Hotel &amp; Suites —
            where every detail is crafted for your comfort.
          </p>

          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px w-16 bg-[#C9A24B]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A24B]" />
            <div className="h-px w-16 bg-[#C9A24B]" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-[#C9A24B] text-[#0B1F3A] font-bold px-8 py-3.5 rounded text-base hover:bg-white transition"
            >
              Reserve Your Room
            </button>
            <button
              onClick={() => scrollTo("rooms")}
              className="border-2 border-white text-white font-bold px-8 py-3.5 rounded text-base hover:border-[#C9A24B] hover:text-[#C9A24B] transition"
            >
              View Rooms
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-[#C9A24B]" />
          <span className="text-xs text-white tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-[#0B1F3A] border-y border-[#C9A24B]/20">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "50+", label: "Luxury Rooms" },
            { value: "3", label: "Room Categories" },
            { value: "24/7", label: "Concierge Service" },
            { value: "100%", label: "Guest Satisfaction" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className={`${display} text-[#C9A24B] font-bold text-3xl`}>{value}</p>
              <p className="text-white text-sm mt-1 font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About split section ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-[#C9A24B] text-xs font-bold tracking-[0.2em] uppercase">
              About Fahari Grand
            </p>
            <h2 className={`${display} text-4xl font-bold leading-tight text-[#0B1F3A]`}>
              Luxury redefined in the heart of Nairobi
            </h2>
            <p className="text-[#0B1F3A] leading-relaxed">
              Fahari Grand Hotel &amp; Suites stands as a beacon of excellence
              in Nairobi&rsquo;s hospitality landscape. From our meticulously
              appointed rooms to our world-class dining, every element is
              designed to create moments that last a lifetime.
            </p>
            <p className="text-[#0B1F3A] leading-relaxed">
              Our dedicated team of professionals is committed to delivering
              personalised service that anticipates your every need — because
              you deserve nothing less than extraordinary.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="text-[#0B1F3A] font-bold underline decoration-[#C9A24B] decoration-2 hover:text-[#C9A24B] text-sm"
            >
              Start your journey
            </button>
          </div>
          <div className="relative h-80 lg:h-96 rounded overflow-hidden">
            <img
              src={LOBBY_IMAGE}
              alt="Fahari Grand Lobby"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-[#0B1F3A] border border-[#C9A24B]/30 px-4 py-3 rounded">
              <p className={`${display} text-[#C9A24B] font-bold text-lg`}>Est. 2024</p>
              <p className="text-white text-xs font-semibold">Nairobi, Kenya</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Rooms Showcase ── */}
      <section id="rooms" className="py-24 px-6 bg-[#FAF8F3] border-y border-[#0B1F3A]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#C9A24B] text-xs font-bold tracking-[0.2em] uppercase mb-3">
              Accommodations
            </p>
            <h2 className={`${display} text-4xl font-bold text-[#0B1F3A]`}>Rooms &amp; Suites</h2>
            <p className="text-[#0B1F3A] mt-3 max-w-md mx-auto">
              Each room is designed to offer the perfect balance of comfort,
              style, and modern convenience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length > 0
              ? rooms.map((room) => (
                  <div
                    key={room.id}
                    className="group bg-white rounded overflow-hidden border border-[#0B1F3A]/10 hover:border-[#C9A24B] transition-all"
                  >
                    <div className="relative h-52 overflow-hidden bg-[#0B1F3A]/5">
                      {room.image ? (
                        <img
                          src={`${CLOUDINARY_BASE}${room.image}`}
                          alt={`Room ${room.room_number}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"
                          alt="Hotel Room"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent" />
                      <span className={`${display} absolute bottom-3 left-3 text-white font-bold text-lg`}>
                        Room {room.room_number}
                      </span>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-[#0B1F3A] text-sm font-semibold capitalize">
                          {roomTypeLabels[room.room_type] || room.room_type} · Floor {room.floor}
                        </p>
                        <div className="text-right">
                          <span className={`${display} text-[#0B1F3A] font-bold`}>
                            KES {parseFloat(room.price_per_night).toLocaleString()}
                          </span>
                          <span className="text-[#0B1F3A] text-xs"> /night</span>
                        </div>
                      </div>
                      <p className="text-[#0B1F3A] text-xs font-semibold">
                        Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""}
                      </p>
                      {room.description && (
                        <p className="text-[#0B1F3A] text-xs line-clamp-2">{room.description}</p>
                      )}
                      <button
                        onClick={() => navigate("/register")}
                        className="w-full py-2 rounded text-sm font-bold bg-[#0B1F3A] text-white hover:bg-[#C9A24B] hover:text-[#0B1F3A] transition"
                      >
                        Book This Room
                      </button>
                    </div>
                  </div>
                ))
              : ["Single Room", "Double Room", "Suite"].map((type, i) => (
                  <div
                    key={type}
                    className="group bg-white rounded overflow-hidden border border-[#0B1F3A]/10 hover:border-[#C9A24B] transition-all"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-${["1631049307264-da0ec9d70304", "1618773928121-c32242e63f39", "1582719508461-905c673771fd"][i]}?w=600&q=80`}
                        alt={type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent" />
                      <span className={`${display} absolute bottom-3 left-3 text-white font-bold text-lg`}>
                        {type}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-[#0B1F3A] text-sm mb-3">
                        Elegant, well-appointed rooms with all modern amenities.
                      </p>
                      <button
                        onClick={() => navigate("/register")}
                        className="w-full py-2 rounded text-sm font-bold bg-[#0B1F3A] text-white hover:bg-[#C9A24B] hover:text-[#0B1F3A] transition"
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
              className="border-2 border-[#0B1F3A] text-[#0B1F3A] px-6 py-2.5 rounded hover:border-[#C9A24B] hover:text-[#C9A24B] transition text-sm font-bold"
            >
              View All Rooms
            </button>
          </div>
        </div>
      </section>

      {/* ── Amenities ── */}
      <section id="amenities" className="relative py-24 px-6 overflow-hidden bg-[#0B1F3A]">
        <img
          src={AMENITY_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#C9A24B] text-xs font-bold tracking-[0.2em] uppercase mb-3">
              What We Offer
            </p>
            <h2 className={`${display} text-4xl font-bold text-white`}>A Cut Above the Rest</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map(({ label, desc }) => (
              <div
                key={label}
                className="bg-[#13294B] border border-[#C9A24B]/20 rounded p-6 space-y-2 hover:border-[#C9A24B] transition"
              >
                <div className="w-8 h-0.5 bg-[#C9A24B] mb-3" />
                <p className={`${display} text-white font-bold text-lg`}>{label}</p>
                <p className="text-white text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#C9A24B] text-xs font-bold tracking-[0.2em] uppercase mb-3">
              Guest Reviews
            </p>
            <h2 className={`${display} text-4xl font-bold text-[#0B1F3A]`}>What Our Guests Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, avatar }) => (
              <div
                key={name}
                className="bg-[#FAF8F3] rounded p-6 space-y-4 border border-[#0B1F3A]/10 hover:border-[#C9A24B] transition"
              >
                <p className={`${display} text-[#0B1F3A] text-base leading-relaxed italic`}>
                  &ldquo;{text}&rdquo;
                </p>
                <div className="border-t border-[#0B1F3A]/10 pt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0B1F3A] flex items-center justify-center text-[#C9A24B] font-bold text-xs">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-[#0B1F3A] font-bold text-sm">{name}</p>
                    <p className="text-[#0B1F3A] text-xs">{role}</p>
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
        <div className="absolute inset-0 bg-[#0B1F3A]/80" />
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <h2 className={`${display} text-4xl sm:text-5xl font-bold text-white`}>
            Ready for an <span className="text-[#C9A24B] italic">Unforgettable</span> Stay?
          </h2>
          <p className="text-white text-lg">
            Reserve your room today and experience the Fahari Grand difference.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#C9A24B] text-[#0B1F3A] font-bold px-10 py-4 rounded text-base hover:bg-white transition"
          >
            Book Your Stay
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#C9A24B]/20 bg-[#0B1F3A]">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div className="space-y-4">
            <p className={`${display} text-[#C9A24B] font-bold text-xl`}>Fahari Grand</p>
            <p className="text-white text-sm italic">Where magnificence lives.</p>
            <p className="text-white text-sm leading-relaxed">
              Nairobi&rsquo;s premier luxury hotel, offering world-class
              accommodation and unparalleled service.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[#C9A24B] font-bold text-sm uppercase tracking-wide">
              Quick Links
            </p>
            <div className="space-y-2">
              {[
                { label: "Browse Rooms", action: () => scrollTo("rooms") },
                { label: "Book a Room", action: () => navigate("/register") },
                { label: "Sign In", action: () => navigate("/login") },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="block text-white hover:text-[#C9A24B] text-sm font-semibold transition"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[#C9A24B] font-bold text-sm uppercase tracking-wide">
              Contact Us
            </p>
            <div className="space-y-2 text-white text-sm font-semibold">
              <p>Nairobi, Kenya</p>
              <p>+254 700 000 000</p>
              <p>info@faharigrand.co.ke</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C9A24B]/20 px-6 py-5">
          <p className="text-center text-white text-xs">
            © {new Date().getFullYear()} Fahari Grand Hotel &amp; Suites. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;