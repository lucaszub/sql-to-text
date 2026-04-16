"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface SparkLineProps {
  data: number[];
  color: string;
  /** true = ligne montante (vert), false = descendante (rouge) */
  positive?: boolean;
}

export function SparkLine({ data, color, positive = true }: SparkLineProps) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%" minWidth={80} minHeight={32}>
        <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={positive ? 0.2 : 0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sg-${color.replace("#", "")})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
