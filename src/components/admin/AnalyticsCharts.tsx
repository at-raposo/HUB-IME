'use client';

import React from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { TrendingUp, Map as MapIcon } from 'lucide-react';

interface AnalyticsChartsProps {
    growthData: any[];
    heatmapData: any[];
}

export default function AnalyticsCharts({ growthData, heatmapData }: AnalyticsChartsProps) {
    const COLORS = ['#0055ff', '#0044cc', '#0033aa', '#002288'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Growth Chart */}
            <div className="bg-white dark:bg-card-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                    <TrendingUp size={20} className="text-[#0055ff]" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Crescimento do Acervo</h3>
                </div>
                <div className="h-[300px] w-full aspect-[16/9] min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0055ff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0055ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#0055ff" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Map Heatmap Chart */}
            <div className="bg-white dark:bg-card-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                    <MapIcon size={20} className="text-[#0055ff]" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Heatmap de Engajamento (Mapa)</h3>
                </div>
                <div className="h-[300px] w-full aspect-[16/9] min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={heatmapData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" hide />
                            <YAxis dataKey="building_id" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="click_count" radius={[0, 10, 10, 0]} barSize={20}>
                                {heatmapData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
