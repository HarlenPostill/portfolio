import { useState } from "react";
import { STRENGTH, STRENGTH_EVENT } from "./shaderStrength";

// Dev-only tuning panel for the background shader. Not rendered in production.
export default function DevStrengthPanel() {
  const [values, setValues] = useState({ ...STRENGTH });

  const update = (key: "dark" | "light", value: number) => {
    STRENGTH[key] = value;
    setValues({ ...STRENGTH });
    window.dispatchEvent(new Event(STRENGTH_EVENT));
  };

  return (
    <div className="dev-panel">
      <strong>Shader strength</strong>
      {(["dark", "light"] as const).map((key) => (
        <label key={key}>
          <span>
            {key} <code>{values[key].toFixed(3)}</code>
          </span>
          <input
            type="range"
            min={0}
            max={0.2}
            step={0.001}
            value={values[key]}
            onChange={(e) => update(key, Number(e.target.value))}
          />
        </label>
      ))}
    </div>
  );
}
