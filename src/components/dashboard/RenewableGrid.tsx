import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useCampusContext } from "@/context/CampusContext";
import { useGridState } from "@/hooks/useEnergy";
import { Skeleton } from "@/components/ui/skeleton";

const colors = ["hsl(161, 93%, 30%)", "hsl(82, 77%, 45%)", "hsl(200, 60%, 50%)"];

const RenewableGrid = () => {
  const { campusId } = useCampusContext();
  const { data: gridState, isLoading } = useGridState(campusId);

  const solarKw = gridState?.solar_current_kw ?? 0;
  const windKw = gridState?.wind_current_kw ?? 0;
  const gridKw = gridState?.grid_import_kw ?? 0;
  const total = solarKw + windKw + gridKw || 1;

  const renewableVsGrid = [
    { name: "Solar", value: Math.round((solarKw / total) * 100) },
    { name: "Wind", value: Math.round((windKw / total) * 100) },
    { name: "Grid", value: Math.round((gridKw / total) * 100) },
  ];

  const renewablePercent = renewableVsGrid
    .filter((r) => r.name !== "Grid")
    .reduce((a, b) => a + b.value, 0);

  if (isLoading) {
    return (
      <div className="glass-card grain-overlay p-5">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-[140px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card grain-overlay p-5">
      <h3 className="font-semibold text-foreground mb-4">Renewable vs Grid</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={renewableVsGrid}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {renewableVsGrid.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(150, 15%, 99%)",
                border: "1px solid hsl(150, 10%, 88%)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {renewableVsGrid.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[i] }} />
              <span className="text-xs text-muted-foreground">{item.name}</span>
              <span className="text-xs font-semibold text-foreground">{item.value}%</span>
            </div>
          ))}
          <div className="pt-1 border-t border-border">
            <p className="text-xs text-primary font-semibold">{renewablePercent}% Renewable</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenewableGrid;
