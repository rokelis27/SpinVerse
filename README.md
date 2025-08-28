# SpinVerse MVP 🎯

**The future of interactive content creation** - Transform spinning wheels into shareable stories with auto-advancing themed sequences and AI-powered narrative generation.

## 🌟 What is SpinVerse?

SpinVerse revolutionizes interactive storytelling by combining spinning wheels with intelligent sequence management and AI-powered narrative generation. Create engaging, shareable stories through choice-driven wheel sequences.

### Core Value Proposition
- **Multiple individual wheels** → **Cohesive story sequences**  
- **Manual content creation** → **AI-enhanced storytelling**
- **Static results** → **Rich narrative experiences**
- **Generic wheels** → **Themed story universes**

---

## 🚀 Features Implemented

### ✅ **Superior Wheel Experience**
- **Canvas-based rendering** with 60fps animations
- **Realistic physics engine** with momentum and friction
- **Touch-optimized** for mobile devices
- **Haptic feedback** and smooth interactions
- **Auto-contrast text** for perfect readability
- **Customizable speeds** (Slow, Normal, Fast, Turbo)

### ✅ **Advanced Sequence Management**
- **Auto-advancing flow** between connected wheels
- **Progress tracking** with visual indicators
- **Smooth transitions** and cinematic animations  
- **Result persistence** throughout sequences
- **Conditional branching** based on previous choices
- **Weighted probability system** for balanced gameplay
- **Step reordering** in sequence builder

### ✅ **Four Complete Story Templates**

#### 🧙‍♂️ **Mystical Academy** (9 steps)
Complete magical journey from origin to career:
- Your magical origin and house sorting
- Specialization and wand selection  
- Academy achievements and signature spells
- Career path determination

#### 🏹 **Survival Tournament** (13 steps)
Epic survival competition with rebellion arc:
- Regional background and training
- Arena challenges and alliances
- Binary survival events
- Victory and resistance role

#### 🕵️‍♂️ **Detective Mystery** (10 steps)
Crime investigation from discovery to trial:
- Crime discovery and investigation methods
- Suspect analysis and evidence gathering
- Dramatic revelations and trial outcomes
- Justice served or escaped

#### 🏁 **Underground Racing** (9 steps)
High-stakes racing career progression:
- Racing origins and vehicle selection
- Crew formation and victory moments
- Sponsorship and biggest challenges
- Heat levels and racing legacy

### ✅ **AI-Powered Story Generation** 🤖
- **Multi-language support** - Automatically detects and responds in user's language
- **Personalized narratives** based on specific choice combinations
- **Character archetype analysis** with real-world comparisons
- **Rarity scoring system** (1-100) for unique combinations
- **Context-aware storytelling** that weaves choices into coherent narratives
- **Theme-specific prompts** optimized for each story universe

### ✅ **Professional Sequence Builder** 🛠️
- **Visual step editor** with drag-and-drop interface
- **AI-powered step enhancement** for options and descriptions
- **Custom wheel configuration** (colors, weights, descriptions)
- **Branching logic editor** with conditional next steps
- **Weight override system** for dynamic probability adjustment
- **Real-time preview** of sequences during building
- **Narrative template system** for story generation

### ✅ **Save & Share System** 💾
- **Local storage** for user-created sequences
- **Import/Export functionality** with JSON format
- **Sequence catalog** with play, edit, and delete options
- **Template cloning** - Edit existing templates as starting points
- **Story export** capabilities for sharing narratives

### ✅ **Enhanced Settings System** ⚙️
- **4 Speed Presets**: Slow, Normal, Fast, Turbo
- **Configurable popup duration** (1-5 seconds)
- **Haptic feedback toggle** for mobile devices
- **Persistent user preferences**

### ✅ **Modern UI/UX Design** 🎨
- **Gaming-inspired interface** with HUD elements
- **Cinematic animations** and transitions
- **Glass morphism effects** and neon highlights
- **Responsive 2x2 template grid** layout
- **Mobile-first design** optimized for all devices
- **Theme-specific iconography** and visual branding
- **Progress visualization** with completion tracking

### ✅ **Advanced Technical Features** 🔧
- **Next.js 15** with App Router architecture
- **TypeScript** for type safety
- **Zustand** for state management
- **Canvas-based wheel rendering** with physics
- **Probability utility system** for fair randomization
- **Conditional branching logic** for dynamic storytelling
- **Performance optimized** with 60fps animations

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenAI API Key** (for AI features)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd spinverse-mvp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your OpenAI API key to .env.local

# Start development server
npm run dev
```

### Environment Variables

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500
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

# Type checking
npm run type-check
```

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── enhance-step/  # AI step enhancement
│   │   └── generate-story/ # AI story generation
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page with template selection
├── components/
│   ├── builder/           # Sequence builder components
│   │   ├── SequenceBuilder.tsx    # Main builder interface
│   │   ├── StepEditor.tsx         # Individual step editor
│   │   ├── BranchEditor.tsx       # Conditional branching
│   │   └── EnhanceStepButton.tsx  # AI enhancement trigger
│   ├── sequence/          # Sequence playthrough components
│   │   ├── SequenceController.tsx # Main sequence logic
│   │   ├── SequenceProgress.tsx   # Progress indicator
│   │   └── SequenceResultsScreen.tsx # Final results with AI story
│   ├── settings/          # Settings system
│   │   └── SettingsPanel.tsx      # Settings modal
│   ├── ui/                # Reusable UI components
│   │   └── TypewriterText.tsx     # Animated text effects
│   └── wheel/             # Core wheel components
│       ├── SpinWheel.tsx          # Canvas-based wheel with physics
│       └── ResultPopup.tsx        # Result display popup
├── data/
│   └── themes.ts          # All 4 story templates definitions
├── hooks/                 # Custom React hooks
│   └── useSavedSequences.ts       # Manage saved sequences
├── stores/                # Zustand state management
│   ├── builderStore.ts    # Sequence builder state
│   ├── sequenceStore.ts   # Sequence playthrough state
│   └── settingsStore.ts   # User preferences
├── types/                 # TypeScript definitions
│   ├── builder.ts         # Builder-specific types
│   ├── sequence.ts        # Core sequence types
│   ├── settings.ts        # Settings types
│   └── wheel.ts           # Wheel and segment types
└── utils/                 # Utility functions
    ├── branchingUtils.ts  # Conditional logic handling
    └── probabilityUtils.ts # Randomization and weighting
```

---

## 🎮 How to Use

1. **Choose a Template**: Select from 4 professionally crafted story universes
2. **Experience the Journey**: Spin through auto-advancing wheel sequences  
3. **Get Your Story**: Receive AI-generated narrative based on your unique choices
4. **Build Custom Sequences**: Use the builder to create your own story universes
5. **Enhance with AI**: Let AI improve your sequences with better options and descriptions
6. **Save & Share**: Export sequences and stories for sharing

---

## 🌍 Multi-Language Support

SpinVerse automatically detects the language of your content and responds accordingly:
- **AI Step Enhancer**: Enhances options in the same language as your sequence
- **AI Story Generator**: Creates narratives in the detected language
- **Supported**: All major languages including Spanish, French, German, Portuguese, Italian, Chinese, Japanese, Korean, Russian, and more

---

## 📊 Current Statistics

- **4 Complete Templates** with 39+ total story steps
- **100+ Unique Wheel Options** across all templates  
- **AI-Enhanced Storytelling** with GPT-4 integration
- **Conditional Branching Logic** for dynamic narratives
- **Mobile-Optimized Experience** for all devices
- **Professional Builder Tools** for content creators

---

## 🔮 What's Next?

See [TODO_LIST_MVP_V2.md](./TODO_LIST_MVP_V2.md) for planned features and improvements.