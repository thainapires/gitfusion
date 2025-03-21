import { useTheme } from "next-themes";
import { BsFillMoonStarsFill } from "react-icons/bs";
import { MdSunny } from "react-icons/md";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "light" ? ( 
        <div className="text-blue-800 p-2 rounded-md border border-zinc-200 shadow bg-gray-100 hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
          <BsFillMoonStarsFill size={17} />
        </div>
      ) : (
        <div className="text-yellow-400 p-2 rounded-md border border-zinc-600 shadow bg-gray-800 hover:bg-gray-700 transition-colors duration-300 cursor-pointer">
          <MdSunny size={17} />
        </div>
      )}
    </button>
  );
}