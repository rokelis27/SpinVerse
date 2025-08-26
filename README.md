# SpinVerse MVP 🎯

**The future of interactive content creation** - Transform spinning wheels into shareable stories with auto-advancing themed sequences.

## 🌟 What is SpinVerse?

SpinVerse solves the problem of creators spending hours manually building multiple wheels and struggling with video stitching. We provide **pre-built themed sequences** that auto-advance through connected wheels and generate social-ready content.

### Core Value Proposition
- **5-8 individual wheels** → **1 cohesive sequence**  
- **Manual stitching** → **Auto-advancing flow**
- **Static results** → **Shareable stories**

---

## 🚀 Features Implemented

### ✅ **Superior Wheel Experience**
- **Canvas-based rendering** with 60fps animations
- **Realistic physics engine** with momentum and friction
- **Touch-optimized** for mobile devices
- **Haptic feedback** and smooth interactions
- **Auto-contrast text** for perfect readability

### ✅ **Sequence State Management**
- **Auto-advancing flow** between connected wheels
- **Progress tracking** with visual indicators
- **Smooth transitions** and animations  
- **Result persistence** throughout sequence
- **Completion detection** with celebration screen

### ✅ **Mystical Academy Theme** 🧙‍♂️
Complete 7-step magical journey:
1. **Your Origin** - Muggle-born, Half-blood, Pure-blood, or Squib Family
2. **Your House** - Courage, Ambition, Loyalty, or Wisdom House
3. **Your Magic Specialization** - Light Magic or Advanced Magic paths
4. **Your Wand** - Different mystical focus and core combinations
5. **Your Academy Achievement** - How you distinguished yourself at school
6. **Your Pet** - Wise Owl, Mystical Cat, Oracle Toad, or other magical companions
7. **Your Signature Spell** - 8 mystical spells to master

### ✅ **Survival Tournament Theme** 🏹
Epic 13-step survival journey:
1. **Your Region** - 12 different regions with unique skills and resources
2. **Competitor Status** - How you entered the tournament
3. **Training Score** - Official assessment from 1-12
4. **Arena Environment** - The battleground that tests your skills
5. **Alliance Strategy** - Who you trust determines survival
6. **Opening Bloodbath** - The deadly first challenge (binary survival)
7. **First Night** - Exposure and basic survival (binary)
8. **Tracker Attack** - Empire creatures hunt you (binary)
9. **Arena Disaster** - Official manipulation (binary)
10. **Beast Attack** - Engineered monsters (binary) 
11. **Alliance Betrayal** - Trust becomes weakness (binary)
12. **Final Showdown** - Victory or death
13. **Resistance Role** - Your part in overthrowing the Empire

### ✅ **Story Generation**
- **Narrative templates** that convert results into readable stories
- **Themed storytelling** - "You are a Pure-blood mage sorted into the House of Courage..."
- **Visual result display** with emojis and themed colors
- **Complete journey summary** at the end

### ✅ **Advanced Settings System**
- **4 Speed Presets**:
  - 🐌 **Slow**: Long, suspenseful spins
  - ⚖️ **Normal**: Balanced spinning experience  
  - 🏃 **Fast**: Quick spins with brief suspense
  - ⚡ **Turbo**: Nearly instant results
- **Configurable popup duration** (1-5 seconds)
- **Haptic feedback toggle** for mobile devices
- **Persistent settings** with localStorage

### ✅ **Enhanced Results Screen**
- **🎉 Celebration display** with animations
- **📖 Complete story narrative** 
- **📊 Visual results grid** showing all choices
- **🔄 Restart option** - Create another story with same theme
- **🏠 Back to themes** - Choose different adventure
- **🎥 Video export placeholder** - Coming soon!

### ✅ **Mobile-First Design**
- **Responsive layout** optimized for portrait mode
- **Touch-friendly controls** with proper hit targets
- **Progressive enhancement** for all devices
- **Portrait optimization** for TikTok/Reels format

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd spinverse-mvp

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page with theme selection
├── components/
│   ├── sequence/          # Sequence flow components
│   │   ├── SequenceController.tsx    # Main sequence logic
│   │   ├── SequenceProgress.tsx      # Progress indicator
│   │   └── SequenceResultsScreen.tsx # Final results display
│   ├── settings/          # Settings system
│   │   └── SettingsPanel.tsx         # Settings modal
│   └── wheel/             # Core wheel components
│       ├── SpinWheel.tsx             # Canvas-based wheel
│       └── ResultPopup.tsx           # Result display popup
├── data/
│   └── themes.ts          # Theme definitions (Harry Potter)
├── stores/                # Zustand state management
│   ├── sequenceStore.ts   # Sequence flow state
│   └── settingsStore.ts   # User preferences
├── types/                 # TypeScript definitions
│   ├── sequence.ts        # Sequence-related types
│   ├── settings.ts        # Settings and speed presets
│   └── wheel.ts           # Wheel component types
└── utils/
    └── wheelThemes.ts     # Theme utilities (legacy)
```

---

## 🎮 How to Use

### 1. **Start a Sequence**
- Open the app at `http://localhost:3000`
- Click on "Mystical Academy: Your Magical Destiny"
- Begin your magical journey!

### 2. **Customize Settings**  
- Click the ⚙️ settings icon in the top-right
- Choose your preferred wheel speed
- Adjust popup duration and haptic feedback
- Settings are automatically saved

### 3. **Experience the Flow**
- Spin the wheel for each step
- Watch results appear with celebration animations
- Automatically advance to the next wheel
- Complete all steps to see your full story (7 for Mystical Academy, 13 for Survival Tournament)

### 4. **View Your Story**
- See the complete narrative generated from your choices
- Review all your results in the organized grid
- Choose to restart with the same theme or try the Survival Tournament

---

## 🔧 Technical Architecture

### **Frontend Stack**
- **Next.js 15** with App Router
- **React 19** with hooks and modern patterns  
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Canvas API** for wheel rendering

### **State Management** 
- **Zustand** for lightweight, fast state management
- **Persistent storage** with localStorage integration
- **DevTools support** for debugging

### **Key Technical Decisions**
- **Canvas over SVG/CSS** for maximum performance and customization
- **RequestAnimationFrame** for smooth 60fps animations  
- **Touch event handling** with momentum calculation
- **Modular component architecture** for easy theme expansion

---

## 🎯 Coming Next (Week 2+)

### **Video Export System** 🎥
- Canvas recording during sequence playback
- MP4 export with 1080x1920 vertical format  
- Direct download to camera roll
- SpinVerse watermark for viral growth

### **More Themes** 🦸‍♂️
- **Superhero Origin Generator** - Powers, origin, team, nemesis
- **Startup Founder Path** - Business journey simulation  
- **Community theme creation** tools

### **Advanced Features**
- Social sharing integrations
- Theme marketplace  
- Custom wheel builder
- Analytics and success tracking

---

## 📱 Browser Support

- **Chrome** 88+ (recommended)
- **Safari** 14+ (iOS/macOS)
- **Firefox** 85+
- **Edge** 88+

**Mobile Optimization**: 
- iOS Safari (primary target)
- Chrome Android
- Touch gestures and haptic feedback

---

## 🤝 Contributing

This is an MVP in active development. Key areas for contribution:

1. **New theme creation** - Add themed sequences
2. **Video export implementation** - Core differentiator  
3. **Mobile performance** optimization
4. **Accessibility** improvements

---

## 📄 License

Private MVP - All rights reserved.

---

**Built with ❤️ for creators who want to turn simple spins into shareable stories.**

🎯 *SpinVerse: Where every spin tells a story.*