import { useTheme } from "next-themes";

export default function ContributionsLegend (){
  const { theme, setTheme } = useTheme();
  const lightThemeColorPallete = ["#DDDEDF", "#196127", "#239a3b", "#7bc96f", "#c6e48b"];
  const darkThemeColorPallete = ["#232e44", "#196127", "#239a3b", "#7bc96f", "#c6e48b"];

  return (
    <div className="flex items-center gap-2 justify-end -mt-3">
      <span className="text-zinc-400 text-sm">Less</span>
      <div className="flex items-center gap-1">
        {theme == "light" ? (
          lightThemeColorPallete.map((color: string, index: number) => (
            <div
              key={index}
              className="w-2 h-2 md:w-4 md:h-4"
              style={{ backgroundColor: color }}
            />
          ))
        ) : (
          darkThemeColorPallete.map((color: string, index: number) => (
            <div
              key={index}
              className="w-2 h-2 md:w-4 md:h-4"
              style={{ backgroundColor: color }}
            />
          ))
        )}
      </div>
      <span className="text-zinc-400 text-sm">More</span>
    </div>
  );
};