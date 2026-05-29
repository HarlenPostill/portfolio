import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { recipes } from "./data";
import { formatAmount, convertUnit, type UnitSystem } from "./utils";
import "./recipes.css";
import Lottie from "lottie-react";
import pieGuyHi from "../assets/lotties/pieguyhi.json";

export default function RecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const recipe = recipes.find((r) => r.slug === slug);

  const [servings, setServings] = useState(recipe?.servings ?? 4);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  if (!recipe) {
    return (
      <div className="recipe-page">
        <nav className="recipes-nav">
          <Link to="/recipes" className="back-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Recipes
          </Link>
        </nav>
        <p className="not-found">Recipe not found.</p>
      </div>
    );
  }

  const scale = servings / recipe.servings;

  function toggleStep(key: string) {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const completedCount = completedSteps.size;
  const totalSteps = recipe.method.reduce((acc, s) => acc + s.steps.length, 0);

  return (
    <div className="recipe-page">
      <nav className="recipes-nav">
        <Link to="/recipes" className="back-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Recipes
        </Link>
      </nav>

      {/* Hero */}
      <header className="recipe-hero">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="recipe-hero-image"
          />
        ) : (
          <div className="recipe-image-placeholder">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect
                x="4"
                y="8"
                width="28"
                height="21"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="18"
                cy="18.5"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="18"
                cy="18.5"
                r="2.5"
                fill="currentColor"
                opacity="0.35"
              />
              <path
                d="M26 11h3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Add your photo here</span>
          </div>
        )}

        <div className="recipe-title-block">
          <div className="recipe-tags">
            {recipe.tags.map((tag) => (
              <span key={tag} className="recipe-tag">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="recipe-main-title">{recipe.title}</h1>
          <p className="recipe-subtitle-text">{recipe.subtitle}</p>
          <div className="recipe-meta-row">
            <div className="recipe-meta-item">
              <span className="meta-label">Prep</span>
              <span className="meta-value">{recipe.prepTime}</span>
            </div>
            <div className="recipe-meta-divider" />
            <div className="recipe-meta-item">
              <span className="meta-label">Cook</span>
              <span className="meta-value">{recipe.cookTime}</span>
            </div>
            <div className="recipe-meta-divider" />
            <div className="recipe-meta-item">
              <span className="meta-label">Serves</span>
              <span className="meta-value">{servings}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="recipe-controls">
        <div className="control-group">
          <span className="control-label">Servings</span>
          <div className="serving-scaler">
            <button
              className="scaler-btn"
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="serving-count">{servings}</span>
            <button
              className="scaler-btn"
              onClick={() => setServings((s) => s + 1)}
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">Units</span>
          <div className="unit-toggle">
            <button
              className={unitSystem === "metric" ? "active" : ""}
              onClick={() => setUnitSystem("metric")}
            >
              Metric
            </button>
            <button
              className={unitSystem === "cup" ? "active" : ""}
              onClick={() => setUnitSystem("cup")}
            >
              Cups
            </button>
          </div>
        </div>

        {completedCount > 0 && (
          <button
            className="reset-steps-btn"
            onClick={() => setCompletedSteps(new Set())}
          >
            Reset steps
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="recipe-content">
        {/* Ingredients */}
        <aside className="ingredients-panel">
          <h2 className="panel-title">Ingredients</h2>
          {recipe.ingredientGroups.map((group) => (
            <div key={group.group} className="ingredient-group">
              <h4 className="ingredient-group-title">{group.group}</h4>
              <ul className="ingredient-list">
                {group.items.map((item) => {
                  const scaled = item.amount * scale;
                  const converted = convertUnit(scaled, item.unit, unitSystem);
                  const displayAmt = formatAmount(converted.amount);
                  return (
                    <li key={item.name} className="ingredient-item">
                      <span className="ingredient-amount">
                        {displayAmt}
                        {converted.unit ? ` ${converted.unit}` : ""}
                      </span>
                      <span className="ingredient-name">{item.name}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Method */}
        <main className="method-panel">
          <div className="method-header">
            <h2 className="panel-title">Method</h2>
            {completedCount > 0 && (
              <span className="step-progress">
                {completedCount} / {totalSteps} steps done
              </span>
            )}
          </div>

          {recipe.method.map((section, sIdx) => (
            <div key={sIdx} className="method-section">
              <div className="method-section-header">
                <span className="method-section-number">{sIdx + 1}</span>
                <h3 className="method-section-title">{section.sectionTitle}</h3>
              </div>
              <div className="method-steps">
                {section.steps.map((step, stepIdx) => {
                  const key = `${sIdx}-${stepIdx}`;
                  const done = completedSteps.has(key);
                  return (
                    <div
                      key={stepIdx}
                      className={`method-step${done ? " done" : ""}`}
                      onClick={() => toggleStep(key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && toggleStep(key)}
                      aria-pressed={done}
                    >
                      <div className="step-check">
                        {done && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M2 5L4.5 7.5L8 3"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="step-text">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {completedCount === totalSteps && totalSteps > 0 && (
            <div className="recipe-complete">
              <span>Enjoy your meal!</span>
            </div>
          )}
        </main>
      </div>
      <div className="pantry-pal-pill">
        <div className="pantry-pal-lottie">
          <Lottie animationData={pieGuyHi} />
        </div>
        <div className="pantry-pal-text">
          <span className="pantry-pal-name">Pantry Pal</span>
          <span className="pantry-pal-tagline">Your kitchen companion</span>
        </div>
        <a
          href="https://pantrypal.com.au"
          target="_blank"
          rel="noopener noreferrer"
          className="pantry-pal-btn"
        >
          Get App
        </a>
      </div>
    </div>
  );
}
