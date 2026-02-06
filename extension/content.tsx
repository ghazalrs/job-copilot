import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const CustomButton = () => {
  return (
    <button
      style={{
        padding: "10px 20px",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px"
      }}>
      Custom button
    </button>
  )
}

export default CustomButton