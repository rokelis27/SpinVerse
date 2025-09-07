# SpinVerse 🎯

**The future of interactive content creation** - Transform spinning wheels into immersive, AI-powered storytelling experiences with premium features and mobile-first design.

## 🌟 What is SpinVerse?

SpinVerse revolutionizes interactive storytelling by combining spinning wheels with intelligent sequence management, AI-powered narrative generation, and premium user experiences. Create engaging, shareable stories through choice-driven wheel sequences with professional-grade tools.

### Core Value Proposition
- **Multiple individual wheels** → **Cohesive story sequences**  
- **Manual content creation** → **AI-enhanced storytelling**
- **Static results** → **Rich narrative experiences**
- **Generic wheels** → **Themed story universes**
- **Basic features** → **Premium subscription platform**

---

## 🚀 Features Implemented

### ✅ **Premium User System** 💎
- **Anonymous-first architecture** - Try before you sign up
- **Clerk authentication** with secure user management
- **FREE/PRO tier system** with feature limits
- **Stripe integration** for seamless PRO subscriptions
- **Usage tracking** with real-time limit monitoring
- **Upgrade flows** with dynamic payment modals
- **Subscription management** synced between Stripe and Clerk

### ✅ **Superior Wheel Experience**
- **Canvas-based rendering** with 60fps animations
- **Realistic physics engine** with momentum and friction
- **Touch-optimized** for mobile devices
- **Haptic feedback** and smooth interactions
- **Auto-contrast text** for perfect readability
- **Customizable speeds** (Slow, Normal, Fast, Turbo)
- **Mobile-first responsive design** for all screen sizes

### ✅ **Advanced Sequence Management**
- **Auto-advancing flow** between connected wheels
- **Progress tracking** with visual indicators
- **Smooth transitions** and cinematic animations  
- **Result persistence** throughout sequences
- **Conditional branching** based on previous choices
- **Weighted probability system** for balanced gameplay
- **Step reordering** in sequence builder
- **Multi-spin system** with dynamic and fixed count modes
- **Dynamic content filtering** (prevents self-matches in World Cup)

### ✅ **Five Immersive Story Templates**

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

#### ⚽ **World Cup Manager** (13 steps) - **NEW!**
Manage your national team through the ultimate tournament:
- Career background and country selection
- Team strengths, weaknesses, and tactical philosophy
- Group stage opponents and performance
- Detailed knockout rounds with opponent draws
- Media reaction and managerial legacy

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
- **Mobile tabbed interface** (Steps/Editor/Story tabs)
- **AI-powered step enhancement** for options and descriptions
- **Custom wheel configuration** (colors, weights, descriptions)
- **Branching logic editor** with conditional next steps
- **Weight override system** for dynamic probability adjustment
- **Real-time preview** of sequences during building
- **Narrative template system** for story generation
- **Import/Export functionality** with JSON format
- **Usage limits** and PRO upgrade integration

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
- **Gaming-inspired interface** with HUD elements and cosmic backgrounds
- **Cinematic animations** and transitions throughout
- **Glass morphism effects** and neon highlights
- **Comprehensive mobile optimization** with touch-friendly controls
- **Responsive layouts** - separate mobile/desktop experiences
- **Mobile tabbed navigation** for complex interfaces
- **Touch targets** optimized for mobile interaction (44px minimum)
- **Theme-specific iconography** and visual branding
- **Progress visualization** with completion tracking
- **Safe area support** for notched devices

### ✅ **Advanced Technical Features** 🔧
- **Next.js 15** with App Router architecture and Turbopack
- **TypeScript** for full type safety
- **Clerk** for authentication and user management
- **Stripe** for subscription billing and payments
- **Zustand** for scalable state management
- **Canvas-based wheel rendering** with realistic physics
- **OpenAI GPT-4** integration for AI features
- **Probability utility system** for fair randomization
- **Conditional branching logic** for dynamic storytelling
- **Mobile-first responsive CSS** with utility classes
- **Performance optimized** with 60fps animations

---

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenAI API Key** (for AI features)
- **Clerk account** (for authentication)
- **Stripe account** (for payment processing)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd spinverse-mvp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys and configuration to .env.local

# Start development server
npm run dev
```

### Environment Variables

```bash
# .env.local

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1500

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe Product Configuration
STRIPE_PRO_PRICE_ID=your_stripe_pro_price_id
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
│   ├── (auth)/            # Authentication pages (sign-in/up)
│   ├── api/               # API routes
│   │   ├── enhance-step/  # AI step enhancement
│   │   ├── generate-story/ # AI story generation
│   │   └── webhooks/      # Stripe webhook handling
│   ├── complete-signup/   # Post-signup flow
│   ├── dashboard/         # User dashboard
│   ├── profile/           # User profile management
│   ├── upgrade/           # PRO upgrade page
│   ├── globals.css        # Global styles with mobile utilities
│   ├── layout.tsx         # Root layout with auth providers
│   └── page.tsx           # Main page with responsive design
├── components/
│   ├── auth/              # Authentication components
│   │   ├── UserButton.tsx        # User profile button
│   │   ├── UpgradePrompt.tsx     # PRO upgrade modal
│   │   └── SignInPrompt.tsx      # Sign-in encouragement
│   ├── builder/           # Sequence builder (mobile-optimized)
│   │   ├── SequenceBuilder.tsx    # Tabbed mobile interface
│   │   ├── StepEditor.tsx         # Touch-friendly step editor
│   │   ├── BranchEditor.tsx       # Conditional branching
│   │   ├── NarrativeTemplateEditor.tsx # Story template system
│   │   └── EnhanceStepButton.tsx  # AI enhancement with limits
│   ├── providers/         # Context providers
│   │   ├── UserProvider.tsx       # User context and features
│   │   └── QueryProvider.tsx      # React Query setup
│   ├── sequence/          # Mobile-optimized sequence components
│   │   ├── SequenceController.tsx # Main sequence logic
│   │   ├── SequenceProgress.tsx   # Mobile-friendly progress cards
│   │   └── SequenceResultsScreen.tsx # Responsive results screen
│   ├── settings/          # Settings system
│   │   └── SettingsPanel.tsx      # Settings modal
│   ├── ui/                # Reusable UI components
│   │   ├── TypewriterText.tsx     # Animated text effects
│   │   └── LoadingSpinner.tsx     # Loading states
│   ├── upgrade/           # Subscription management
│   │   └── UpgradeFlow.tsx        # Stripe integration flow
│   └── wheel/             # Core wheel components
│       ├── SpinWheel.tsx          # Touch-optimized wheel physics
│       └── ResultPopup.tsx        # Mobile-friendly popups
├── data/
│   └── themes.ts          # All 5 story templates definitions
├── hooks/                 # Custom React hooks
│   ├── useSavedSequences.ts       # Manage saved sequences
│   └── useFeatureGate.ts          # FREE/PRO feature limiting
├── lib/                   # Core utilities
│   ├── clerk.ts           # Clerk configuration
│   ├── stripe.ts          # Stripe setup
│   └── openai.ts          # OpenAI client
├── stores/                # Zustand state management
│   ├── builderStore.ts    # Sequence builder state
│   ├── sequenceStore.ts   # Sequence playthrough state
│   ├── settingsStore.ts   # User preferences
│   └── userStore.ts       # User subscription state
├── types/                 # TypeScript definitions
│   ├── builder.ts         # Builder-specific types
│   ├── database.ts        # User data types
│   ├── sequence.ts        # Core sequence types
│   ├── settings.ts        # Settings types
│   └── wheel.ts           # Wheel and segment types
└── utils/                 # Utility functions
    ├── branchingUtils.ts  # Conditional logic handling
    └── probabilityUtils.ts # Randomization and weighting
```

---

## 🎮 How to Use

### **For Players**
1. **Try Anonymous**: Start spinning immediately without signing up
2. **Choose a Template**: Select from 5 professionally crafted story universes
3. **Experience the Journey**: Spin through auto-advancing wheel sequences on any device
4. **Get Your Story**: Receive AI-generated narrative based on your unique choices
5. **Sign Up for More**: Create account for saved stories and unlimited access

### **For Creators**
1. **Go PRO**: Subscribe for unlimited sequence creation and AI features
2. **Build Custom Sequences**: Use the mobile-optimized builder with tabbed interface
3. **Enhance with AI**: Let AI improve your sequences with better options and descriptions
4. **Test & Preview**: Real-time preview of your sequences before publishing
5. **Import & Export**: Share sequences with JSON format

---

## 🌍 Multi-Language Support

SpinVerse automatically detects the language of your content and responds accordingly:
- **AI Step Enhancer**: Enhances options in the same language as your sequence
- **AI Story Generator**: Creates narratives in the detected language
- **Supported**: All major languages including Spanish, French, German, Portuguese, Italian, Chinese, Japanese, Korean, and more

---

## 📊 Current Statistics

- **5 Complete Templates** with 54+ total story steps
- **200+ Unique Wheel Options** across all templates  
- **Premium User System** with FREE/PRO tiers
- **AI-Enhanced Storytelling** with GPT-4 integration
- **Comprehensive Mobile Optimization** for all screen sizes
- **Touch-Friendly Interface** with 44px minimum targets
- **Professional Builder Tools** with tabbed mobile interface
- **Stripe Integration** for seamless subscription management
- **Anonymous-First Experience** for instant engagement

---

## 🔮 What's Next?

See [TODO_LIST_MVP_V2.md](./TODO_LIST_MVP_V2.md) for planned features and improvements.