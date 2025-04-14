"use client";

import React from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';

interface ScoreChartProps {
  data: {
    name: string;
    score: number;
    fullMark: number;
  }[];
  color: string;
}

export default function ScoreChart({ data, color }: ScoreChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Score"
          dataKey="score"
          stroke={color}
          fill={color}
          fillOpacity={0.6}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
