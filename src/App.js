import React, { useState, useEffect } from "react";
import {
  Leaf,
  Recycle,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Play,
  BookOpen,
  Home,
  Trophy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Loader2,
  Search,
  TrendingUp,
  AlertOctagon,
  Info,
  Calculator,
  Banknote,
  Lightbulb,
  Shirt,
  Package,
  Clock,
  Heart,
} from "lucide-react";

// --- GEMINI API SETUP ---
const apiKey = "";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchWithRetry = async (url, options, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      if (i === retries - 1) throw e;
      await delay(Math.pow(2, i) * 1000); // 1s, 2s, 4s, 8s, 16s
    }
  }
};

const analyzeItemWithAI = async (itemName) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        parts: [
          {
            text: `The user wants to throw away: "${itemName}". Determine the correct bin according to the standard US 3-bin waste segregation system (Green: Compost/Organics, Blue: Recyclables, Black: Landfill/Trash).`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: "You are an expert waste management assistant. Classify the item accurately. Provide a relevant emoji, the bin, and a short, encouraging, educational fact explaining the 'why'.",
        },
      ],
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          emoji: {
            type: "STRING",
            description: "A single representative emoji for the item.",
          },
          bin: {
            type: "STRING",
            description: "Must be EXACTLY 'Green', 'Blue', or 'Black'",
          },
          fact: {
            type: "STRING",
            description:
              "A fun, educational fact about disposing or recycling this item.",
          },
        },
        required: ["emoji", "bin", "fact"],
      },
    },
  };

  const data = await fetchWithRetry(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return JSON.parse(data.candidates[0].content.parts[0].text);
};

// --- DATA ---
const BINS = [
  {
    id: "Green",
    name: "Compost (Organics)",
    color: "bg-green-500",
    hover: "hover:bg-green-600",
    icon: Leaf,
    desc: "Food scraps, yard waste, and soiled paper.",
  },
  {
    id: "Blue",
    name: "Recyclables",
    color: "bg-blue-500",
    hover: "hover:bg-blue-600",
    icon: Recycle,
    desc: "Clean paper, cardboard, plastic bottles/jugs, glass, and metal cans.",
  },
  {
    id: "Black",
    name: "Landfill (Trash)",
    color: "bg-slate-800",
    hover: "hover:bg-slate-900",
    icon: Trash2,
    desc: "Non-recyclable plastics, wrappers, broken glass, sanitary waste.",
  },
];

const GAME_ITEMS = [
  {
    id: 1,
    name: "Apple Core & Peels",
    emoji: "🍎",
    bin: "Green",
    fact: "Organic waste like fruit cores can be composted into nutrient-rich soil! Your kitchen scraps are gold for a compost bin.",
  },
  {
    id: 2,
    name: "Cardboard Delivery Box",
    emoji: "📦",
    bin: "Blue",
    fact: "Flatten boxes before recycling to save space. Make sure to remove any plastic tape first!",
  },
  {
    id: 3,
    name: "Empty Batteries",
    emoji: "🔋",
    bin: "Black",
    fact: "Batteries contain toxic chemicals. While they go in the trash if no other option exists, they ideally need special e-waste or hazardous drop-off!",
  },
  {
    id: 4,
    name: "Greasy Pizza Box",
    emoji: "🍕",
    bin: "Black",
    fact: "Surprise! Grease ruins paper fibers. The greasy part goes in the landfill (or compost, depending on local rules), but not in dry recycling.",
  },
  {
    id: 5,
    name: "Clean Plastic Bottle",
    emoji: "💧",
    bin: "Blue",
    fact: "PET plastics are highly recyclable. Empty the liquid, crush the bottle, and put the cap back on before tossing it in the blue bin.",
  },
  {
    id: 6,
    name: "Leftover Dal/Vegetables",
    emoji: "🍲",
    bin: "Green",
    fact: "Wet food waste decomposes naturally. Keeping this out of landfills prevents the release of methane, a potent greenhouse gas.",
  },
  {
    id: 7,
    name: "Empty Chip Packet",
    emoji: "🍿",
    bin: "Black",
    fact: "Multi-layered plastics (shiny on the inside) are very hard to recycle. They usually go in the landfill/trash bin.",
  },
  {
    id: 8,
    name: "Old Smartphone",
    emoji: "📱",
    bin: "Black",
    fact: "E-waste is growing fast! Always give old electronics to certified e-waste recyclers so heavy metals don't pollute the soil and water.",
  },
  {
    id: 9,
    name: "Rinsed Glass Jar",
    emoji: "🫙",
    bin: "Blue",
    fact: "Glass can be recycled endlessly without losing quality. Just make sure it's rinsed clean!",
  },
  {
    id: 10,
    name: "Used Paper Napkins",
    emoji: "🧻",
    bin: "Black",
    fact: "Used paper napkins and tissues are contaminated, and their fibers are too short to recycle. Put them in the trash.",
  },
];

const ECO_TIPS = [
  {
    title: "Start Composting",
    text: "Since food scraps make up a large portion of household waste, starting a small home compost bin is a great idea! It turns peels and scraps into incredible fertilizer for household plants.",
  },
  {
    title: "Ditch Single-Use Bags",
    text: "Keep a few reusable cloth bags in your car or by the door. This simple habit saves hundreds of plastic bags from entering landfills each year.",
  },
  {
    title: "Repurpose Glass Jars",
    text: "Don't throw away pasta sauce or pickle jars! Wash them out and use them to store grains, bulk foods, or even use them as drinking glasses or plant propagators.",
  },
  {
    title: "The 'First In, First Out' Rule",
    text: "Organize your fridge so older food is at the front. This reduces food waste, which is a massive contributor to greenhouse gas emissions in landfills.",
  },
  {
    title: "Defeat Vampire Power",
    text: "Electronics draw power even when turned off. Unplug chargers, TVs, and small appliances when not in use, or plug them into a power strip you can switch off.",
  },
  {
    title: "Repair Before Replacing",
    text: "Got a hole in your shirt or a broken toaster? Try finding a local repair cafe or watching a quick tutorial before throwing it away and buying new.",
  },
  {
    title: "Cut the Junk Mail",
    text: "Take 5 minutes to unsubscribe from catalog mailing lists and switch all your bills to paperless. It saves trees and reduces the energy used to transport mail.",
  },
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState("home"); // 'home', 'game', 'learn', 'ai', 'impact'

  // Navigation Helper
  const NavButton = ({ view, icon: Icon, label, sparkle }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${
        currentView === view
          ? "text-emerald-600 bg-emerald-50"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      <div className="relative">
        <Icon size={24} />
        {sparkle && (
          <Sparkles
            size={12}
            className="absolute -top-1 -right-2 text-amber-500"
          />
        )}
      </div>
      <span className="text-xs font-medium mt-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-600">
            <Recycle
              size={28}
              className="animate-spin-slow"
              style={{ animationDuration: "4s" }}
            />
            <h1 className="text-xl font-bold tracking-tight">EcoSort</h1>
          </div>
          <nav className="flex gap-2">
            <NavButton view="home" icon={Home} label="Home" />
            <NavButton view="game" icon={Play} label="Play" />
            <NavButton view="ai" icon={Search} label="AI Sort" sparkle />
            <NavButton view="impact" icon={TrendingUp} label="Impact" />
            <NavButton view="learn" icon={BookOpen} label="Learn" />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto p-4 pb-24">
        {currentView === "home" && (
          <HomeView
            onPlay={() => setCurrentView("game")}
            onLearn={() => setCurrentView("learn")}
            onAI={() => setCurrentView("ai")}
            onImpact={() => setCurrentView("impact")}
          />
        )}
        {currentView === "game" && <GameView />}
        {currentView === "ai" && <AIScannerView />}
        {currentView === "impact" && <ImpactView />}
        {currentView === "learn" && <LearnView />}
      </main>
    </div>
  );
}

// --- HOME VIEW ---
function HomeView({ onPlay, onLearn, onAI, onImpact }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg text-center">
        <Leaf size={48} className="mx-auto mb-4 opacity-90" />
        <h2 className="text-3xl font-extrabold mb-2">Master Your Waste!</h2>
        <p className="text-emerald-50 mb-6">
          Learn how to sort your trash correctly, save the planet, and become an
          Eco-Champion.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onPlay}
            className="bg-white text-emerald-600 font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full text-lg"
          >
            <Play fill="currentColor" size={20} />
            Play the Game
          </button>
          <button
            onClick={onAI}
            className="bg-emerald-800 text-emerald-50 font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full text-lg"
          >
            <Sparkles size={20} className="text-amber-300" />✨ AI Item Scanner
          </button>
          <button
            onClick={onImpact}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 w-full text-lg"
          >
            <TrendingUp size={20} />
            My Impact & Savings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-3">
            <Recycle size={24} />
          </div>
          <h3 className="font-bold text-slate-800">Why Sort?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Mixed waste goes to landfills. Sorted waste becomes resources!
          </p>
        </div>
        <div
          onClick={onLearn}
          className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="bg-amber-100 text-amber-600 p-3 rounded-full mb-3">
            <BookOpen size={24} />
          </div>
          <h3 className="font-bold text-slate-800">Study Guide</h3>
          <p className="text-xs text-slate-500 mt-1">
            Read the rules before you test your knowledge.
          </p>
        </div>
      </div>

      {/* DONATION SECTION */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-6 shadow-sm text-center relative overflow-hidden">
        <Heart
          size={80}
          className="absolute -left-4 -bottom-4 text-rose-200 opacity-50"
        />
        <h3 className="font-bold text-rose-800 mb-2 flex items-center justify-center gap-2 relative z-10">
          <Heart size={20} className="text-rose-500" /> Support the Mission
        </h3>
        <p className="text-slate-700 text-sm leading-relaxed mb-4 relative z-10">
          Want to make a bigger impact? Your donations directly fund{" "}
          <strong>Systemic Recycling Advocacy</strong> across the USA. We use
          these funds to lobby for better recycling infrastructure in
          underserved small towns, and aggressively pressure major corporate
          polluters to fundamentally change how they produce and package their
          products!
        </p>

        <a
          href="https://paypal.me/danellejoye"
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-6 rounded-full shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
        >
          <Heart fill="currentColor" size={18} />
          Donate to Outreach
        </a>
      </div>
    </div>
  );
}

// --- GAME VIEW ---
function GameView() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // null, { isCorrect: bool, message: string }
  const [gameOver, setGameOver] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Shuffle items
    const shuffled = [...GAME_ITEMS].sort(() => 0.5 - Math.random());
    setItems(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setGameOver(false);
  };

  const handleSort = (selectedBinId) => {
    if (feedback || gameOver) return; // Prevent clicking while feedback is showing

    const currentItem = items[currentIndex];
    const isCorrect = selectedBinId === currentItem.bin;

    if (isCorrect) {
      setScore((s) => s + 10);
    }

    setFeedback({
      isCorrect,
      message: currentItem.fact,
      correctBin: BINS.find((b) => b.id === currentItem.bin).name,
    });
  };

  const nextItem = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((c) => c + 1);
      setFeedback(null);
    } else {
      setGameOver(true);
    }
  };

  if (items.length === 0) return <div>Loading...</div>;

  if (gameOver) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100 animate-in zoom-in duration-300">
        <Trophy size={64} className="mx-auto text-amber-400 mb-4" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">Game Over!</h2>
        <p className="text-slate-500 mb-6">
          You scored {score} out of {items.length * 10}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-8">
          <p className="font-medium text-slate-700">
            {score === items.length * 10
              ? "Perfect! You're a true Eco-Warrior! 🌍"
              : score > (items.length * 10) / 2
              ? "Great job! Keep practicing to save the planet! 🌱"
              : "Good try! Read the Learn section to boost your score next time! 📚"}
          </p>
        </div>

        <button
          onClick={startNewGame}
          className="bg-emerald-500 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
          Play Again
        </button>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Item {currentIndex + 1} of {items.length}
        </div>
        <div className="bg-emerald-100 text-emerald-700 font-black px-4 py-1 rounded-full text-lg">
          {score} pts
        </div>
      </div>

      {/* Main Game Area */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden">
        {/* The Item */}
        {!feedback ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-8xl mb-4 drop-shadow-md select-none">
              {currentItem.emoji}
            </div>
            <h3 className="text-2xl font-bold text-slate-800">
              {currentItem.name}
            </h3>
            <p className="text-slate-500 mt-2">
              Which bin does this belong in?
            </p>
          </div>
        ) : (
          /* Feedback Screen */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 py-4">
            {feedback.isCorrect ? (
              <div className="text-emerald-500 flex flex-col items-center mb-4">
                <CheckCircle2 size={48} className="mb-2" />
                <h3 className="text-2xl font-bold">Spot On!</h3>
              </div>
            ) : (
              <div className="text-red-500 flex flex-col items-center mb-4">
                <XCircle size={48} className="mb-2" />
                <h3 className="text-2xl font-bold">Not Quite!</h3>
                <p className="text-slate-600 text-sm mt-1">
                  It goes in:{" "}
                  <span className="font-bold">{feedback.correctBin}</span>
                </p>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100 text-slate-700 text-sm leading-relaxed mb-6">
              <strong>Fact:</strong> {feedback.message}
            </div>

            <button
              onClick={nextItem}
              className="bg-slate-800 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 w-full"
            >
              Next Item
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Bin Buttons */}
      <div
        className={`grid grid-cols-1 gap-3 transition-opacity duration-300 ${
          feedback ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        {BINS.map((bin) => (
          <button
            key={bin.id}
            onClick={() => handleSort(bin.id)}
            className={`${bin.color} ${bin.hover} text-white p-4 rounded-2xl shadow-sm transition-transform active:scale-95 flex items-center gap-4`}
          >
            <div className="bg-white/20 p-3 rounded-full">
              <bin.icon size={28} />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-bold text-lg">{bin.name}</h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- LEARN VIEW ---
function LearnView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 rounded-2xl p-6 text-white text-center shadow-lg">
        <BookOpen size={40} className="mx-auto mb-3 text-emerald-400" />
        <h2 className="text-2xl font-bold mb-2">The 3-Bin System</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Mastering the standard segregation rules helps keep resources in the
          loop and out of landfills. Here is your cheat sheet!
        </p>
      </div>

      <div className="space-y-4">
        {BINS.map((bin) => (
          <div
            key={bin.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 overflow-hidden relative"
          >
            {/* Background decorative element */}
            <div
              className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${bin.color}`}
            ></div>

            <div className="flex items-center gap-4 mb-3 relative z-10">
              <div
                className={`${bin.color} text-white p-3 rounded-xl shadow-sm`}
              >
                <bin.icon size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{bin.name}</h3>
            </div>

            <p className="text-slate-600 text-sm mb-3 relative z-10">
              {bin.desc}
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 relative z-10 text-xs text-slate-500">
              <strong>Common items: </strong>
              {bin.id === "Green" &&
                "Fruit peels, rotten vegetables, yard clippings, soiled paper."}
              {bin.id === "Blue" &&
                "Newspaper, cardboard, plastic bottles/jugs, glass jars, aluminum cans."}
              {bin.id === "Black" &&
                "Diapers, broken ceramics, used syringes, greasy wrappers, non-recyclable plastics."}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-emerald-800 flex items-center gap-2">
            <Leaf size={18} /> Eco Tip of the Day
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-200/50 px-2 py-1 rounded-full">
            Daily
          </span>
        </div>
        <h5 className="font-bold text-emerald-900 text-sm mb-1">
          {ECO_TIPS[new Date().getDay() % ECO_TIPS.length].title}
        </h5>
        <p className="text-emerald-700 text-sm leading-relaxed">
          {ECO_TIPS[new Date().getDay() % ECO_TIPS.length].text}
        </p>
      </div>

      {/* NEW PLASTIC SECTION */}
      <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <AlertOctagon
          size={80}
          className="absolute -right-4 -bottom-4 text-slate-700 opacity-50"
        />
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400 relative z-10">
          <AlertOctagon size={24} /> The Plastic Illusion
        </h3>

        <div className="space-y-4 relative z-10 text-sm text-slate-300">
          <div className="bg-slate-700 p-4 rounded-xl">
            <h4 className="font-bold text-white mb-1">
              1. The "Chasing Arrows" Myth
            </h4>
            <p>
              Just because a plastic item has the ♻️ triangle with a number
              inside <strong>DOES NOT</strong> mean it is recyclable. Plastic
              manufacturers created this "Resin Identification Code" to look
              like a recycling symbol, shifting the blame to consumers while
              greenwashing their products. Usually, only #1 (PET bottles) and #2
              (HDPE jugs) are widely recycled.
            </p>
          </div>

          <div className="bg-slate-700 p-4 rounded-xl">
            <h4 className="font-bold text-white mb-1">
              2. The Multi-Layer Nightmare
            </h4>
            <p>
              Ever wonder why chip packets or tetra-packs are so hard to
              recycle? They fuse different materials together (e.g., plastic +
              aluminum foil). Because these layers cannot be easily separated at
              facilities, they almost always end up in landfills or
              incinerators.
            </p>
          </div>

          <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-100">
            <h4 className="font-bold text-white mb-1 flex items-center gap-2">
              <Info size={16} /> Take Action Locally!
            </h4>
            <p>
              Don't just throw things away and hope for the best. Talk to your
              city council or local waste management provider. Ask them exactly
              what they accept. Demand that the municipality invest in better
              sorting facilities, and support legislation that holds
              corporations accountable for the waste they produce!
            </p>
          </div>
        </div>
      </div>

      {/* NEW TIPS SECTION */}
      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
        <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
          <Lightbulb size={24} className="text-amber-500" /> Pro Sorting Tips
        </h3>
        <ul className="space-y-4 text-sm text-amber-900">
          <li className="flex gap-3">
            <span className="font-black text-amber-500 text-lg leading-none">
              1
            </span>
            <span>
              <strong>Rinse & Dry:</strong> A single dollop of leftover dal or
              grease can ruin an entire batch of clean paper at the recycling
              center. Always give containers a quick rinse!
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-black text-amber-500 text-lg leading-none">
              2
            </span>
            <span>
              <strong>Keep it Loose:</strong> Don't put your recyclables inside
              plastic garbage bags. Sorting machines can't easily open them, and
              bagged recyclables often get tossed straight into the landfill.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-black text-amber-500 text-lg leading-none">
              3
            </span>
            <span>
              <strong>Squash & Cap:</strong> Crush your plastic bottles to save
              space, and <em>screw the cap back on!</em> Loose caps are too
              small and fall through the cracks of recycling facility belts, but
              are fully recyclable when attached.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-black text-amber-500 text-lg leading-none">
              4
            </span>
            <span>
              <strong>Call Ahead for Bulk:</strong> Always check with your local
              recycling center before throwing away anything big or in large
              volumes. You never know—cities are waking up to better waste
              management, and they might have new special drop-off programs for
              bulky items!
            </span>
          </li>
        </ul>
      </div>

      {/* NEW AFTERLIFE SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Sparkles size={24} className="text-emerald-500" /> The Afterlife of
          Waste
        </h3>
        <p className="text-sm text-slate-500 mb-5">
          What actually happens to the stuff you put in the blue bin?
        </p>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 hover:scale-[1.02] transition-transform">
            <Shirt size={28} className="text-blue-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-1">
                Plastic Bottles (PET)
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Can be spun into polyester fiber! Just 5 plastic bottles can
                yield enough fiber for an extra-large t-shirt, or they can
                become sleeping bag insulation and fleece jackets.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl border border-slate-200 hover:scale-[1.02] transition-transform">
            <Clock size={28} className="text-slate-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Aluminum Cans
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Aluminum is infinitely recyclable. An empty can you recycle
                today could be melted down, reformed, and back on a supermarket
                shelf in as little as 60 days!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 hover:scale-[1.02] transition-transform">
            <Package size={28} className="text-amber-600 shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm mb-1">
                Paper & Cardboard
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Paper can be recycled 5 to 7 times before the plant fibers get
                too short and weak. It gets repurposed into new cardboard boxes,
                egg cartons, or even toilet paper!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- AI SCANNER VIEW ---
function AIScannerView() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeItemWithAI(input);
      setResult(data);
    } catch (err) {
      setError(
        "Oops! Our AI is taking a quick eco-break. Please try again in a moment."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBinData = (binId) => {
    // Fallback to Black if AI hallucinates a weird bin color
    return (
      BINS.find((b) => b.id === binId) || BINS.find((b) => b.id === "Black")
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-800 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden">
        <Sparkles
          size={100}
          className="absolute -top-10 -right-10 text-slate-700 opacity-50"
        />
        <Search size={40} className="mx-auto mb-3 text-amber-400" />
        <h2 className="text-2xl font-bold mb-2">✨ AI Item Scanner</h2>
        <p className="text-slate-300 text-sm leading-relaxed relative z-10">
          Not sure where an item goes? Type it below and our AI Eco-Assistant
          will tell you exactly how to dispose of it!
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. Broken coffee mug, empty toothpaste..."
          className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-4 pr-14 text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 top-2 bottom-2 bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center aspect-square"
        >
          {loading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Search size={24} />
          )}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative overflow-hidden animate-in zoom-in duration-300">
          <div className="text-8xl mb-4 drop-shadow-md select-none">
            {result.emoji}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 capitalize mb-6">
            "{input}"
          </h3>

          {(() => {
            const binInfo = getBinData(result.bin);
            return (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl ${binInfo.color} text-white flex items-center justify-center gap-3 shadow-sm`}
                >
                  <binInfo.icon size={28} />
                  <span className="text-xl font-bold">{binInfo.name}</span>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-amber-500" />
                    AI Eco-Fact
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {result.fact}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// --- CURRENCY DATA ---
const CURRENCIES = {
  USD: { symbol: "$", rate: 1, name: "USD" },
  INR: { symbol: "₹", rate: 83.5, name: "INR" },
  EUR: { symbol: "€", rate: 0.92, name: "EUR" },
  GBP: { symbol: "£", rate: 0.79, name: "GBP" },
  AUD: { symbol: "A$", rate: 1.52, name: "AUD" },
  CAD: { symbol: "C$", rate: 1.36, name: "CAD" },
  JPY: { symbol: "¥", rate: 153.0, name: "JPY" },
};

// --- IMPACT & SAVINGS VIEW ---
function ImpactView() {
  const [compostKg, setCompostKg] = useState(5);
  const [recycleKg, setRecycleKg] = useState(10);
  const [donateItems, setDonateItems] = useState(2);
  const [currency, setCurrency] = useState("USD");

  // Rough estimation values for USA context (Base USD)
  const compostValuePerKg = 0.5; // $ saved on fertilizer/soil per lb/kg of compost & trash bags
  const recycleValuePerKg = 0.2; // Average $ saved in municipal disposal fees per kg
  const donateValuePerItem = 15; // Average $ saved by not buying new or value provided to someone else

  const baseMonthlySavings =
    (compostKg * compostValuePerKg +
      recycleKg * recycleValuePerKg +
      donateItems * donateValuePerItem) *
    4;
  const currentCurrency = CURRENCIES[currency];

  const displaySavings = (
    baseMonthlySavings * currentCurrency.rate
  ).toLocaleString(undefined, {
    minimumFractionDigits: currency === "INR" || currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "INR" || currency === "JPY" ? 0 : 2,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-600 rounded-2xl p-6 text-white text-center shadow-lg">
        <TrendingUp size={40} className="mx-auto mb-3 text-blue-200" />
        <h2 className="text-2xl font-bold mb-2">Impact & Savings</h2>
        <p className="text-blue-100 text-sm leading-relaxed">
          Recycling and reusing isn't just good for the earth—it saves you money
          and prevents massive municipal waste expenses!
        </p>
      </div>

      {/* CALCULATOR */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calculator size={20} className="text-blue-500" /> Your Weekly Habits
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Wet Waste Composted (kg/week)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={compostKg}
              onChange={(e) => setCompostKg(e.target.value)}
              className="w-full accent-green-500"
            />
            <div className="text-right text-sm font-medium text-slate-700">
              {compostKg} kg
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Dry Recyclables Sold/Given (kg/week)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={recycleKg}
              onChange={(e) => setRecycleKg(e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="text-right text-sm font-medium text-slate-700">
              {recycleKg} kg
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
              Items Donated/Reused (per week)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={donateItems}
              onChange={(e) => setDonateItems(e.target.value)}
              className="w-full accent-amber-500"
            />
            <div className="text-right text-sm font-medium text-slate-700">
              {donateItems} items
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
          <div className="flex justify-between items-center w-full mb-3">
            <p className="text-sm font-bold text-slate-500 text-left">
              Estimated Monthly Savings
            </p>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-md px-2 py-1.5 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
            >
              {Object.entries(CURRENCIES).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name} ({data.symbol})
                </option>
              ))}
            </select>
          </div>
          <div className="text-4xl font-black text-emerald-600 flex items-center justify-center gap-2">
            <Banknote size={32} /> {currentCurrency.symbol}
            {displaySavings}
          </div>
        </div>
      </div>

      {/* THE TRUE COST OF LANDFILLS */}
      <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shadow-sm">
        <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
          <Trash2 size={20} /> The Expense of Landfills
        </h3>

        <ul className="space-y-3 text-sm text-red-900">
          <li className="flex gap-2">
            <span className="font-bold text-red-500">•</span>
            <span>
              <strong>Monetary Drain:</strong> Municipalities spend massive
              amounts of taxpayer money just to transport and dump waste. That's
              money that could go to parks, roads, and schools.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-red-500">•</span>
            <span>
              <strong>Toxic Leachate:</strong> Rainwater mixing with landfill
              trash creates a toxic soup ("leachate") that seeps into and
              poisons local groundwater.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-red-500">•</span>
            <span>
              <strong>Methane Bombs:</strong> When organic food rots in an
              oxygen-deprived landfill, it produces Methane—a greenhouse gas 25x
              more potent than CO2. Composting at home prevents this entirely!
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-red-500">•</span>
            <span>
              <strong>Resource Waste:</strong> Making a new plastic bottle from
              scratch takes heavily subsidized fossil fuels. Recycling saves up
              to 80% of the energy compared to making new products from raw
              materials.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
