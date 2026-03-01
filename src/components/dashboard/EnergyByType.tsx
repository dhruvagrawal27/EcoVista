import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useCampusContext } from "@/context/CampusContext";
import { useEquipmentLoad } from "@/hooks/useEnergy";
import { Skeleton } from "@/components/ui/skeleton";

const colors = [
  "hsl(161, 93%, 30%)",
  "hsl(141, 69%, 50%)",
  "hsl(172, 66%, 45%)",
  "hsl(82, 77%, 45%)",
  "hsl(200, 60%, 50%)",
];

const EnergyByType = () => {
  const { campusId } = useCampusContext();
  const { data: equipment, isLoading } = useEquipmentLoad(campusId);

  // Aggregate load by equipment_type
  const typeMap = new Map<string, number>();
  for (const eq of equipment ?? []) {
    const type = eq.equipment_type ?? "Other";
    typeMap.set(type, (typeMap.get(type) ?? 0) + (eq.latest_load?.load_kw ?? 0));
  }
  const total = Array.from(typeMap.values()).reduce((a, b) => a + b, 0) || 1;
  const chartData = Array.from(typeMap.entries()).map(([name, kwh]) => ({
    name,
    value: Math.round((kwh / total) * 100),
    kwh: kwh.toFixed(1),
  }));

  if (isLoading) {
    return (
      <div className="glass-card grain-overlay p-5">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card grain-overlay p-5">
      <h3 className="font-semibold text-foreground mb-4">Energy by Type</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(150, 15%, 99%)",
              border: "1px solid hsl(150, 10%, 88%)",
              borderRadius: "12px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value}%`, "Share"]}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyByType;
