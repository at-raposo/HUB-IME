'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#EF4444', '#EAB308', '#8B5CF6', '#10B981', '#F59E0B'];

interface ChartProps {
  data: any[];
  type: 'bar' | 'line' | 'pie';
  dataKey?: string;
  nameKey?: string;
  height?: number;
}

export default function TelemetryCharts({ data, type, dataKey = 'value', nameKey = 'name', height = 300 }: ChartProps) {
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey={nameKey} 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey={dataKey} fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey={nameKey} 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Line type="monotone" dataKey={dataKey} stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}
