export default function ContributionsLegend (){
  const colors = ["#18181B", "#196127", "#239a3b", "#7bc96f", "#c6e48b"]; 

  return (
    <div className="flex items-center gap-2 justify-end -mt-3">
      <span className="text-zinc-400 text-xs">Less</span>
      <div className="flex items-center gap-1">
        {colors.map((color, index) => (
          <div
            key={index}
            className="w-2 h-2"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-zinc-400 text-xs">More</span>
    </div>
  );
};