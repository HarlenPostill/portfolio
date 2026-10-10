export type Channel = "apps" | "games" | "work" | "awards";

export interface Item {
  title: string;
  role: string;
  description: string;
  date?: string;
  url: string;
}

export interface ChannelInfo {
  id: Channel;
  number: string;
  label: string;
  blurb: string;
  items: Item[];
}

export const channels: ChannelInfo[] = [
  {
    id: "apps",
    number: "01",
    label: "Apps",
    blurb: "Things you can put in your pocket.",
    items: [
      {
        title: "Anicue",
        role: "Creator",
        description:
          "Skeuomorphic inspired iOS anime discovery app with social features and recommendations.",
        url: "https://anicue.hrln-interactive.com/",
      },
      {
        title: "PantryPal",
        role: "Lead Founding Engineer",
        description:
          "Meal planning app reducing food waste with intelligent recipe suggestions.",
        date: "Jun 2024 – Now",
        url: "https://www.pantrypal.com.au/",
      },
    ],
  },
  {
    id: "games",
    number: "02",
    label: "Games",
    blurb: "Small worlds with rules.",
    items: [
      {
        title: "Sweeping Home",
        role: "Creator",
        description:
          "Puzzle adventure about a robot vacuum navigating an island to reach a house and clean it. Out now on Steam for macOS and Windows.",
        url: "https://sweeping-home.hrln-interactive.com/",
      },
      {
        title: "Verbolley",
        role: "Creator",
        description:
          "The tennis word game. Every shot is a word — type a word to hit it back. Coming soon for iPhone.",
        url: "https://verbolley.hrln-interactive.com/",
      },
    ],
  },
  {
    id: "work",
    number: "03",
    label: "Work",
    blurb: "Teams I've shipped with.",
    items: [
      {
        title: "Ourfit",
        role: "Founding Engineer",
        description:
          "Hire clothes from real people's wardrobes and dress hire businesses — or earn from your own. All in one place.",
        date: "Jul 2026 – Now",
        url: "https://ourfit.app/",
      },
      {
        title: "OneTeam",
        role: "Senior Associate Software Engineer",
        description:
          "Software for fintech enterprise collaboration and automation.",
        date: "Aug 2023 – Apr 2026",
        url: "https://tax-oneteam.vercel.app/",
      },
      {
        title: "Community Compass",
        role: "Lead Developer",
        description:
          "A local community map for Ultimo and nearby areas to get involved and discover resources.",
        url: "https://communitycompass.com.au/",
      },
    ],
  },
  {
    id: "awards",
    number: "04",
    label: "Awards",
    blurb: "Moments the work got noticed.",
    items: [
      {
        title: "UTS Tech Fest — Game Design Methodologies",
        role: "First Place",
        description:
          "Puzzle game where you control a cat and its companion shadow at the same time.",
        date: "2025",
        url: "https://auroraechoes.itch.io/overshadowed",
      },
      {
        title: "Samsung Solve for Tomorrow Australia",
        role: "Runner Up",
        description:
          "Gamifies community mapping to find accessible routes for wheelchair users on iOS & Android.",
        date: "2024",
        url: "https://news.samsung.com/au/inventive-device-to-help-prevent-overuse-of-pesticides-in-agriculture-wins-samsungs-solve-for-tomorrow-competition",
      },
    ],
  },
];

export const channelById = (id: string | undefined) =>
  channels.find((c) => c.id === id);
