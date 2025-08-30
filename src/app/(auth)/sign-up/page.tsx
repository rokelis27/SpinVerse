import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm transition-all duration-200',
              card: 'bg-gray-900/80 backdrop-blur-sm border border-gray-800 shadow-2xl',
              headerTitle: 'text-white text-2xl font-bold',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 
                'border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700/50 transition-all duration-200',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 
                'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500',
              footerActionLink: 'text-purple-400 hover:text-purple-300',
              dividerLine: 'bg-gray-700',
              dividerText: 'text-gray-400',
            },
          }}
        />
      </div>
    </div>
  );
}