import { TypeAnimation } from "react-type-animation";

const TypingAnim = () => {
  return (
    <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed once, initially
        "Data Structures & Algorithms",
        1000,
        "Sorting Algorithms (Bubble, Merge, Quick...)",
        1800,
        "Big‑O Time Complexity Made Simple",
        1800,
        "Practice. Analyze. Improve.",
        1400,
      ]}
      speed={50}
      style={{
        fontSize: "60px",
        color: "#DBD8E3",
        display: "inline-block",
        textShadow: "1px 1px 20px #000",
      }}
      repeat={Infinity}
    />
  );
};

export default TypingAnim;
