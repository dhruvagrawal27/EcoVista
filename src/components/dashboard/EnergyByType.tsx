import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { energyByType } from "@/lib/mock-data";

const colors = [
  "hsl(161, 93%, 30%)",
  "hsl(141, 69%, 50%)",
  "hsl(172, 66%, 45%)",
  "hsl(82, 77%, 45%)",
  "hsl(200, 60%, 50%)",
];

const EnergyByType = () => {
  return (
    <div className="glass-card grain-overlay p-5">
      <h3 className="font-semibold text-foreground mb-4">Energy by Type</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={energyByType} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(160, 10%, 45%)" }} tickLine={false} axisLine={false} width={60} />
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
            {energyByType.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnergyByType;
