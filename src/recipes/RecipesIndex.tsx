import { Link } from "react-router-dom";
import { recipes } from "./data";
import "./recipes.css";
import pieGuyHi from "../assets/lotties/pieguyhi.json";
import Lottie from "lottie-react";

export default function RecipesIndex() {
  return (
    <div className="recipes-page">
      <nav className="recipes-nav">
        <Link to="/" className="back-link">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 3L5 8L10 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Portfolio
        </Link>
      </nav>

      <header className="recipes-header">
        <h1 className="recipes-title">Recipes</h1>
        <p className="recipes-subtitle">Things I like to cook.</p>
      </header>

      <div className="recipes-grid">
        {recipes.map((recipe) => (
          <Link
            key={recipe.slug}
            to={`/recipes/${recipe.slug}`}
            className="recipe-card"
          >
            <div className="recipe-card-image">
              {recipe.image && <img src={recipe.image} alt={recipe.title} />}
            </div>
            <div className="recipe-card-body">
              <div>
                <h3 className="recipe-card-title">{recipe.title}</h3>
                <p className="recipe-card-subtitle">{recipe.subtitle}</p>
              </div>
              <p className="recipe-card-description">{recipe.description}</p>
              <div className="recipe-card-meta">
                <span>{recipe.prepTime} prep</span>
                <span className="meta-dot" />
                <span>{recipe.cookTime} cook</span>
                <span className="meta-dot" />
                <span>Serves {recipe.servings}</span>
              </div>
            </div>
          </Link>
        ))}
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
