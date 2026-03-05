import { loadSettings } from "@/lib/aiSettings";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Build system tone based on settings (kept for architecture consistency)
 */
function buildSystemPrompt(): string {
  const settings = loadSettings();
  return settings.systemPrompt || "";
}

/**
 * Generate a more realistic demo AI response
 */
function generateDemoResponse(messages: ChatMessage[]): string {
  const systemTone = buildSystemPrompt();
  const lastUserMessage =
    messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";

  const text = lastUserMessage.toLowerCase().trim();

  const intros = [
    "Great question.",
    "That's an interesting topic.",
    "Let’s break this down clearly.",
    "Here’s a structured explanation.",
  ];

  const randomIntro = intros[Math.floor(Math.random() * intros.length)];

  if (!text) {
    return "How can I assist you today?";
  }

  if (text.includes("react")) {
    return `${randomIntro} React is a declarative, component-based JavaScript library designed for building scalable and maintainable user interfaces. It enables efficient state management and reusability across complex applications.`;
  }

  if (text.includes("ai") || text.includes("artificial intelligence")) {
    return `${randomIntro} Artificial Intelligence refers to systems capable of learning patterns, making predictions, and simulating decision-making processes using trained models and algorithms.`;
  }

  if (text.includes("portfolio")) {
    return `${randomIntro} A strong frontend portfolio should demonstrate clean architecture, responsive UI design, performance optimization, accessibility practices, and thoughtful user experience decisions.`;
  }

  if (text.includes("javascript")) {
    return `${randomIntro} JavaScript is a versatile programming language that powers modern web applications across both frontend and backend environments through frameworks and runtime platforms.`;
  }

  if (text.includes("who are you")) {
    return "I’m a simulated AI assistant built for showcasing frontend architecture, UI design, and streaming interaction patterns in this demo application.";
  }

  if (text === "hi" || text === "hello") {
    return "Hello 👋 I'm SmartAI (Demo Mode). How can I help you today?";
  }

  return `${randomIntro} In this demo version, responses are simulated for frontend showcase purposes. In a production setup, this would connect securely to a backend-powered AI model.`;
}

/**
 * Streaming simulation to mimic real AI typing behavior
 */
export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMessage[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const responseText = generateDemoResponse(messages);

    // Simulate streaming (character-by-character)
    for (let i = 0; i < responseText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 12));
      onDelta(responseText[i]);
    }

    onDone();
  } catch {
    onError("Demo AI failed to generate a response.");
  }
}