import { UserRound } from "lucide-react";

function PrivateDisplayPic({
  variant = "large",
}: {
  variant?: "large" | "mid";
}) {
  return (
    <div>
      <div
        className={`${variant === "large" ? "w-[108px] h-[108px]" : "w-[56px] h-[56px]"} rounded-full bg-[#D9D9D9] border-[1px] border-[#D9D9D9] overflow-hidden relative`}
      >
        <div className={`absolute ${variant === "large" ? "top-4" : "top-2"}`}>
          <UserRound
            className={`${variant === "large" ? "w-[108px] h-[108px]" : "w-[56px] h-[56px]"}`}
            stroke="#A4A4A4"
            strokeWidth="0.8"
            fill="#EEEEEE"
          />
        </div>
      </div>
    </div>
  );
}

export default PrivateDisplayPic;
