// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fbcbe418342984050af50d2882303371@o4509957944377344.ingest.de.sentry.io/4509957946277968",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Add feedback integration
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "system",
      showBranding: false,
      buttonLabel: "Report Bug or Give Feedback",
      submitButtonLabel: "Send Feedback",
      formTitle: "SpinVerse Feedback",
      nameLabel: "Name (Optional)",
      namePlaceholder: "Your name...",
      emailLabel: "Email (Optional)", 
      emailPlaceholder: "your.email@example.com",
      messageLabel: "Describe your feedback",
      messagePlaceholder: "Tell us about bugs, feature requests, or general feedback...",
      successMessageText: "Thank you for your feedback! We'll review it and get back to you if needed.",
      isRequiredLabel: "(required)",
      addScreenshotButtonLabel: "Add Screenshot",
      removeScreenshotButtonLabel: "Remove Screenshot",
      themeDark: {
        background: "#1a1a1a",
        backgroundHover: "#262626", 
        foreground: "#ffffff",
        error: "#ef4444",
        success: "#22c55e",
        border: "#404040",
        interactiveFilter: "brightness(0.9)"
      },
      themeLight: {
        background: "#ffffff",
        backgroundHover: "#f5f5f5",
        foreground: "#1a1a1a", 
        error: "#ef4444",
        success: "#22c55e",
        border: "#e5e5e5",
        interactiveFilter: "brightness(0.95)"
      }
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;