export type MetricUnit =
  | "g"
  | "kg"
  | "ml"
  | "L"
  | "tsp"
  | "tbsp"
  | "cloves"
  | "";

export interface Ingredient {
  amount: number;
  unit: MetricUnit;
  name: string;
}

export interface IngredientGroup {
  group: string;
  items: Ingredient[];
}

export interface MethodSection {
  sectionTitle: string;
  steps: string[];
}

export interface Recipe {
  slug: string;
  title: string;
  subtitle: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  description: string;
  tags: string[];
  image?: string;
  ingredientGroups: IngredientGroup[];
  method: MethodSection[];
}

export const recipes: Recipe[] = [
  {
    slug: "garlic-parmesan-chicken-thighs",
    title: "Garlic Parmesan Chicken Thighs",
    subtitle: "with Creamy Dijon Mash & Zesty Green Beans",
    prepTime: "20 mins",
    cookTime: "30 mins",
    servings: 4,
    description:
      "Juicy oven-baked chicken thighs finished in a rich parmesan cream sauce, paired with silky Dijon mash and vibrant lemon green beans.",
    tags: ["Chicken", "Dinner", "Comfort Food"],
    image: "/recipeImages/garlicparmthigh.png",
    ingredientGroups: [
      {
        group: "Chicken & Sauce",
        items: [
          { amount: 5, unit: "", name: "chicken thighs" },
          { amount: 2, unit: "tbsp", name: "olive oil" },
          { amount: 1, unit: "tsp", name: "garlic powder" },
          { amount: 1, unit: "tsp", name: "onion powder" },
          { amount: 1, unit: "tsp", name: "smoked paprika" },
          { amount: 1, unit: "", name: "shallot, finely diced" },
          { amount: 3, unit: "cloves", name: "garlic, minced" },
          { amount: 125, unit: "ml", name: "chicken stock" },
          { amount: 100, unit: "g", name: "crème fraîche" },
          { amount: 30, unit: "g", name: "Parmesan, grated" },
          { amount: 2, unit: "tbsp", name: "fresh mixed herbs" },
          { amount: 0.5, unit: "", name: "lemon, juiced" },
        ],
      },
      {
        group: "Creamy Dijon Mash",
        items: [
          { amount: 800, unit: "g", name: "potatoes, peeled and cut" },
          { amount: 50, unit: "g", name: "unsalted butter" },
          { amount: 60, unit: "ml", name: "milk" },
          { amount: 1.5, unit: "tsp", name: "Dijon mustard" },
        ],
      },
      {
        group: "Zesty Green Beans",
        items: [
          { amount: 350, unit: "g", name: "fresh green beans, trimmed" },
          { amount: 1, unit: "tbsp", name: "olive oil" },
          { amount: 0.5, unit: "", name: "lemon, zested and juiced" },
        ],
      },
    ],
    method: [
      {
        sectionTitle: "Prep & Potatoes",
        steps: [
          "Preheat your oven to 180°C (350°F).",
          "Place the cut potatoes into a large pot of cold, salted water. Bring to a boil over high heat, then reduce to a simmer. Cook for approximately 15 minutes, or until completely fork-tender.",
        ],
      },
      {
        sectionTitle: "Season & Bake the Chicken",
        steps: [
          "Flatten the chicken thighs to an even thickness (deboning if necessary). Using a sharp knife, lightly score the top in a crosshatch pattern.",
          "In a small bowl, mix the garlic powder, onion powder, paprika, olive oil, and a pinch of salt and pepper. Brush generously over both sides of the chicken.",
          "Arrange on a baking sheet and bake for 20–25 minutes, or until the internal temperature reaches 82°C (180°F).",
        ],
      },
      {
        sectionTitle: "Finishing the Mash",
        steps: [
          "Drain the cooked potatoes thoroughly and return to the pot or a large bowl.",
          "Add the butter, Dijon mustard, and warm milk. Mash until completely smooth and creamy. Season with salt, cover to keep warm, and set aside.",
        ],
      },
      {
        sectionTitle: "Finish the Chicken & Start the Sauce",
        steps: [
          "Remove the chicken from the oven. Heat a large pan over medium-high heat and sear the thighs for 1–2 minutes per side until golden.",
          "Transfer the chicken to a plate, sprinkle generously with extra grated Parmesan, and let it rest for 5 minutes.",
          "Wipe any burnt bits from the skillet, leaving the flavourful oils. Drop the heat to medium-low, add the diced shallot and minced garlic, and sauté for 2 minutes until aromatic. Do not let the garlic burn.",
          "Pour in the chicken stock, scraping up any stuck bits. Simmer for 3–4 minutes until reduced and less watery.",
          "Turn the heat to low and stir in the crème fraîche, Parmesan, and fresh herbs. Let the sauce gently simmer until thickened. Stir in the lemon juice at the very end.",
        ],
      },
      {
        sectionTitle: "Cook the Beans",
        steps: [
          "In a separate small pan over medium-high heat, add the olive oil. Sauté the green beans for 3–4 minutes until tender-crisp and lightly blistered.",
          "Just before removing from the heat, toss in the lemon juice and zest. Season with a pinch of salt.",
        ],
      },
      {
        sectionTitle: "To Serve",
        steps: [
          "Spoon a generous portion of creamy mash onto each plate.",
          "Arrange the beans alongside the mash and top with a rested chicken thigh.",
          "Spoon the rich pan sauce over the chicken. Garnish with extra fresh chives or parsley if desired.",
        ],
      },
    ],
  },
];
