import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCampusContext } from "@/context/CampusContext";
import { useEnergyReadings } from "@/hooks/useEnergy";
import { Skeleton } from "@/components/ui/skeleton";

const EnergyChart = () => {
  const [showPredicted, setShowPredicted] = useState(true);
  const { campusId } = useCampusContext();
  const { data: readings, isLoading } = useEnergyReadings(campusId, 24);

  const chartData = (readings ?? []).map((r) => ({
    hour: new Date(r.recorded_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
    actual: r.actual_kw ?? 0,
    predicted: r.predicted_kw ?? 0,
    solar: r.solar_kw ?? 0,
  }));

  if (isLoading) {
    return (
      <div className="glass-card grain-overlay p-5 h-full">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-6" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card grain-overlay p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Campus Energy Live</h3>
          <p className="text-xs text-muted-foreground">Real-time consumption vs AI prediction</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPredicted(!showPredicted)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              showPredicted
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            Show Predicted
          </button>
          <select className="bg-muted/50 border border-border rounded-full px-3 py-1.5 text-xs text-foreground focus:outline-none">
            <option>All Buildings</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(161, 93%, 30%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(161, 93%, 30%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(172, 66%, 45%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(172, 66%, 45%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(82, 77%, 45%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(82, 77%, 45%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 10%, 88%)" strokeOpacity={0.5} />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} tickLine={false} axisLine={false} width={45} />
          <Tooltip
            contentStyle={{
              background: "hsl(150, 15%, 99%)",
              border: "1px solid hsl(150, 10%, 88%)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />
          <Legend />
          <Area type="monotone" dataKey="actual" stroke="hsl(161, 93%, 30%)" fill="url(#actualGrad)" strokeWidth={2} name="Actual (kW)" />
          {showPredicted && (
            <Area type="monotone" dataKey="predicted" stroke="hsl(172, 66%, 45%)" fill="url(#predictedGrad)" strokeWidth={2} strokeDasharray="5 5" name="Predicted (kW)" />
          )}
          <Area type="monotone" dataKey="solar" stroke="hsl(82, 77%, 45%)" fill="url(#solarGrad)" strokeWidth={2} name="Solar (kW)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyChart;
