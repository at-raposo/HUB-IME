'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { 
  Activity, 
  Users, 
  Clock, 
  MousePointer2, 
  Search, 
  Download, 
  FileJson, 
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  History,
  LayoutGrid,
  Zap,
  Heart,
  Trophy,
  ExternalLink,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Dynamic import for Recharts to avoid hydration errors
const TelemetryCharts = dynamic(
  () => import('@/components/admin/telemetry/TelemetryCharts'),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center bg-white/5 animate-pulse rounded-2xl">Carregando Gráficos...</div> }
);

interface TelemetryEvent {
  id: string;
  event_type: string;
  url: string;
  metadata: any;
  created_at: string;
  session_id: string;
  user_id?: string;
  profiles?: {
    full_name: string;
    user_category: string;
    course: string;
    education_level: string;
  };
}

export function TelemetryManager() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [segment, setSegment] = useState<string>('all');
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [uidInput, setUidInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'geral' | 'ux' | 'valor' | 'empolgados' | 'eficiencia'>('geral');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Analysis States
  const [kpis, setKpis] = useState({
    totalEvents: 0,
    uniqueUsers: 0,
    avgTime: 0,
    searchSuccessRate: 0,
    totalRageClicks: 0,
    csat: 0,
    avgTtfa: 0,
    formAbandonment: 0,
    totalSearches: 0
  });
  const [eventTypeData, setEventTypeData] = useState<any[]>([]);
  const [deptEngagement, setDeptEngagement] = useState<any[]>([]);
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const [topFailedSearches, setTopFailedSearches] = useState<any[]>([]);
  const [routeHealth, setRouteHealth] = useState<any[]>([]);
  const [timePerRoute, setTimePerRoute] = useState<any[]>([]);
  const [frictionPoints, setFrictionPoints] = useState<any[]>([]);
  const [adoptionMetrics, setAdoptionMetrics] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [usefulPosts, setUsefulPosts] = useState<any[]>([]);
  
  // Tab 5: Scientific Analysis
  const [formatPerformance, setFormatPerformance] = useState<any[]>([]);
  const [cognitiveLoadData, setCognitiveLoadData] = useState<any[]>([]);
  const [engagementByFormat, setEngagementByFormat] = useState<any[]>([]);
  const [audioFunnelData, setAudioFunnelData] = useState<any[]>([]);
  const [playCount, setPlayCount] = useState(0);

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const selectFields = segment === 'all' 
        ? '*, profiles(full_name, user_category, course, education_level)'
        : '*, profiles!inner(full_name, user_category, course, education_level)';

      let query = supabase
        .from('telemetry_events')
        .select(selectFields)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (segment !== 'all') {
        if (segment === 'licenciatura' || segment === 'bacharelado') {
          query = query.eq('profiles.course', segment.charAt(0).toUpperCase() + segment.slice(1));
        } else if (segment === 'pos_graduacao') {
          query = query.ilike('profiles.education_level', '%graduação%');
        } else if (segment === 'docente_pesquisador') {
          query = query.eq('profiles.user_category', 'pesquisador');
        } else {
          query = query.eq('profiles.user_category', segment);
        }
      }

      if (targetUserId) {
        query = query.eq('user_id', targetUserId);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        setEvents(data as TelemetryEvent[]);
        processData(data as TelemetryEvent[]);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
      toast.error('Erro ao carregar dados de telemetria');
    } finally {
      setIsLoading(false);
    }
  };

  const processData = (rawData: TelemetryEvent[]) => {
    // 1. KPIs
    const uniqueSessions = new Set(rawData.map(e => e.session_id)).size;
    const timeEvents = rawData.filter(e => e.event_type === 'TIME_ON_PAGE');
    const avgTime = timeEvents.length > 0 
      ? timeEvents.reduce((acc, e) => acc + (e.metadata?.seconds || 0), 0) / timeEvents.length 
      : 0;
    
    const searchSuccess = rawData.filter(e => e.event_type === 'SEARCH_SUCCESS').length;
    const searchFail = rawData.filter(e => e.event_type === 'SEARCH_FAIL').length;
    const searchSuccessRate = (searchSuccess + searchFail) > 0 
      ? Math.round((searchSuccess / (searchSuccess + searchFail)) * 100) 
      : 0;

    const rageClicks = rawData.filter(e => e.event_type === 'RAGE_CLICK');

    // CSAT Logic
    const ratings = rawData.filter(e => e.event_type === 'CONTENT_RATING');
    const positive = ratings.filter(e => e.metadata?.rating === 'positive').length;
    const csat = ratings.length > 0 ? Math.round((positive / ratings.length) * 100) : 0;

    // TTFA Logic
    const ttfaEvents = rawData.filter(e => e.event_type === 'FIRST_ACTION_TAKEN');
    const avgTtfa = ttfaEvents.length > 0
      ? ttfaEvents.reduce((acc, e) => acc + (e.metadata?.ms || 0), 0) / ttfaEvents.length
      : 0;

    const formAbandonment = rawData.filter(e => e.event_type === 'FORM_ABANDONMENT').length;

    setKpis({
      totalEvents: rawData.length,
      uniqueUsers: uniqueSessions,
      avgTime: Math.round(avgTime),
      searchSuccessRate,
      totalRageClicks: rageClicks.length,
      csat,
      avgTtfa: Math.round(avgTtfa),
      formAbandonment,
      totalSearches: searchSuccess + searchFail
    });

    // 2. Event Types Bar Chart
    const typeCount: Record<string, number> = {};
    rawData.forEach(e => {
      typeCount[e.event_type] = (typeCount[e.event_type] || 0) + 1;
    });
    setEventTypeData(Object.entries(typeCount).map(([name, value]) => ({ name, value })));

    // 3. Dept Engagement Pie Chart
    const deptCount: Record<string, number> = {};
    rawData.filter(e => e.event_type === 'DEPT_FILTER').forEach(e => {
      const name = e.metadata?.dept_name || 'Geral';
      deptCount[name] = (deptCount[name] || 0) + 1;
    });
    setDeptEngagement(Object.entries(deptCount).map(([name, value]) => ({ name, value })));

    // 4. Adoption Tab Metrics
    const adoption = [
      { name: 'Textos Copiados', value: rawData.filter(e => e.event_type === 'TEXT_COPIED').length },
      { name: 'Links Compartilhados', value: rawData.filter(e => e.event_type === 'LINK_SHARED').length },
      { name: 'Hover Intent', value: rawData.filter(e => e.event_type === 'HOVER_INTENT').length },
      { name: 'Tooltips Vistos', value: rawData.filter(e => e.event_type === 'TOOLTIP_VIEWED').length }
    ];
    setAdoptionMetrics(adoption);

    // 5. Empolgados (Top Users)
    const userStats: Record<string, { name: string, category: string, count: number }> = {};
    rawData.forEach(e => {
      if (e.user_id) {
        if (!userStats[e.user_id]) {
          userStats[e.user_id] = { 
            name: (e as any).profiles?.full_name || 'Usuário Anônimo', 
            category: (e as any).profiles?.user_category || 'Externo', 
            count: 0 
          };
        }
        userStats[e.user_id].count += 1;
      }
    });
    setTopUsers(
      Object.entries(userStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([id, data]) => ({ id, ...data }))
    );

    // 6. Top Useful Posts
    const postHelp: Record<string, { title: string, positive: number, total: number }> = {};
    ratings.forEach(e => {
      const pid = e.metadata?.post_id;
      if (pid) {
        if (!postHelp[pid]) postHelp[pid] = { title: e.metadata?.post_title || pid, positive: 0, total: 0 };
        postHelp[pid].total += 1;
        if (e.metadata?.rating === 'positive') postHelp[pid].positive += 1;
      }
    });
    setUsefulPosts(
      Object.entries(postHelp)
        .sort((a, b) => b[1].positive - a[1].positive)
        .slice(0, 3)
        .map(([id, data]) => ({ id, ...data, score: Math.round((data.positive / data.total) * 100) }))
    );

    // Rest of previous metrics
    const searchCount: Record<string, number> = {};
    rawData.filter(e => e.event_type === 'SEARCH_QUERY' || e.event_type === 'SEARCH_SUCCESS').forEach(e => {
      const q = e.metadata?.query?.toLowerCase().trim();
      if (q) searchCount[q] = (searchCount[q] || 0) + 1;
    });
    setTopSearches(Object.entries(searchCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })));

    const failedSearchCount: Record<string, number> = {};
    rawData.filter(e => e.event_type === 'SEARCH_FAIL').forEach(e => {
      const q = e.metadata?.query?.toLowerCase().trim();
      if (q) failedSearchCount[q] = (failedSearchCount[q] || 0) + 1;
    });
    setTopFailedSearches(Object.entries(failedSearchCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value })));

    const routeTime: Record<string, { total: number, count: number }> = {};
    timeEvents.forEach(e => {
      const path = e.url || '/unknown';
      if (!routeTime[path]) routeTime[path] = { total: 0, count: 0 };
      routeTime[path].total += (e.metadata?.seconds || 0);
      routeTime[path].count += 1;
    });
    setTimePerRoute(Object.entries(routeTime).map(([name, data]) => ({ name, value: Math.round(data.total / data.count) })).sort((a, b) => b.value - a.value).slice(0, 5));

    const friction: Record<string, number> = {};
    rageClicks.forEach(e => {
      const path = e.url || '/unknown';
      friction[path] = (friction[path] || 0) + 1;
    });
    setFrictionPoints(Object.entries(friction).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5));

    // Matriz de Saúde da Rota
    const routeStats: Record<string, { totalTime: number, timeCount: number, rageCount: number }> = {};
    
    timeEvents.forEach(e => {
      const path = e.url || '/unknown';
      if (!routeStats[path]) routeStats[path] = { totalTime: 0, timeCount: 0, rageCount: 0 };
      routeStats[path].totalTime += (e.metadata?.seconds || 0);
      routeStats[path].timeCount += 1;
    });

    rageClicks.forEach(e => {
      const path = e.url || '/unknown';
      if (!routeStats[path]) routeStats[path] = { totalTime: 0, timeCount: 0, rageCount: 0 };
      routeStats[path].rageCount += 1;
    });

    const routeHealthData = Object.entries(routeStats).map(([path, data]) => {
      const avgRouteTime = data.timeCount > 0 ? data.totalTime / data.timeCount : 0;
      const isHighTime = avgRouteTime >= (avgTime > 0 ? avgTime : 30); // Acima da média global
      const isHighRage = data.rageCount > 0;

      let status = '';
      let color = '';
      let labelColor = '';

      if (isHighTime && isHighRage) {
          status = 'CRÍTICO: Usuário Travado';
          color = 'border-brand-red/40 bg-brand-red/5 hover:bg-brand-red/10';
          labelColor = 'text-brand-red';
      } else if (isHighTime && !isHighRage) {
          status = 'SUCESSO: Alto Engajamento';
          color = 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10';
          labelColor = 'text-green-500';
      } else if (!isHighTime && isHighRage) {
          status = 'ERRO: Frustração Rápida';
          color = 'border-brand-yellow/40 bg-brand-yellow/5 hover:bg-brand-yellow/10';
          labelColor = 'text-brand-yellow';
      } else {
          status = 'NEUTRO: Visita Curta';
          color = 'border-white/10 bg-white/[0.02] hover:bg-white/5';
          labelColor = 'text-gray-400';
      }

      return {
          path,
          avgRouteTime: Math.round(avgRouteTime),
          rageCount: data.rageCount,
          status,
          color,
          labelColor
      };
    }).sort((a, b) => b.rageCount - a.rageCount || b.avgRouteTime - a.avgRouteTime).slice(0, 12);
    
    setRouteHealth(routeHealthData);

    // 7. Tab 5: Scientific Processing
    // A. Format Performance (Avg Time)
    const formatTime: Record<string, { total: number, count: number }> = {};
    timeEvents.forEach(e => {
        const fmt = e.metadata?.content_format || 'unknown';
        if (!formatTime[fmt]) formatTime[fmt] = { total: 0, count: 0 };
        formatTime[fmt].total += (e.metadata?.seconds || 0);
        formatTime[fmt].count += 1;
    });
    setFormatPerformance(Object.entries(formatTime).map(([name, data]) => ({ 
        name: name.toUpperCase(), 
        value: Math.round(data.total / data.count) 
    })));

    // B. Cognitive Load (Time/Words)
    const loadByFormat: Record<string, { totalLoad: number, count: number }> = {};
    timeEvents.filter(e => e.metadata?.word_count > 0).forEach(e => {
        const fmt = e.metadata?.content_format || 'text';
        const load = e.metadata.seconds / e.metadata.word_count;
        if (!loadByFormat[fmt]) loadByFormat[fmt] = { totalLoad: 0, count: 0 };
        loadByFormat[fmt].totalLoad += load;
        loadByFormat[fmt].count += 1;
    });
    setCognitiveLoadData(Object.entries(loadByFormat).map(([name, data]) => ({
        name: name.toUpperCase(),
        value: Number((data.totalLoad / data.count).toFixed(4))
    })));

    // C. Engagement by Format (KPIs)
    const engByFmt: Record<string, number> = {};
    const engageEvents = rawData.filter(e => ['CONTENT_RATING', 'TEXT_COPIED', 'LINK_SHARED'].includes(e.event_type));
    engageEvents.forEach(e => {
        const fmt = e.metadata?.content_format || 'unknown';
        engByFmt[fmt] = (engByFmt[fmt] || 0) + 1;
    });
    setEngagementByFormat(Object.entries(engByFmt).map(([name, value]) => ({ 
        name: name.toUpperCase(), 
        value 
    })));

    // D. Audio Funnel
    const pCount = rawData.filter(e => e.event_type === 'AUDIO_PLAY').length;
    const midCount = rawData.filter(e => e.event_type === 'SCROLL_50').length; 
    const endCount = rawData.filter(e => e.event_type === 'AUDIO_ENDED').length;
    
    setPlayCount(pCount);
    setAudioFunnelData([
        { name: 'PLAY', value: pCount },
        { name: '50% MILT', value: midCount },
        { name: 'ENDED', value: endCount }
    ]);
  };


  useEffect(() => {
    fetchTelemetry();
  }, [timeRange, segment, targetUserId]);

  const exportCSV = () => {
    const headers = ['ID', 'Horário', 'Tipo', 'Slug (URL)', 'Metadata', 'Sessão'];
    const rows = events.map(e => [
      e.id,
      new Date(e.created_at).toLocaleString('pt-BR'),
      e.event_type,
      e.url,
      JSON.stringify(e.metadata).replace(/"/g, '""'),
      e.session_id
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `telemetria_USP_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const paginatedEvents = events.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Interativo Interno */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2">
            <Activity className="w-3 h-3" />
            Nível 5+ Ativo (Omnisciente)
          </div>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tighter">
            Análise de <span className="text-brand-yellow">Dados</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  timeRange === r ? 'bg-brand-blue text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <select
            value={segment}
            onChange={(e) => { setSegment(e.target.value); setTargetUserId(''); setUidInput(''); }}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-brand-blue/50 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Filtro de Curso</option>
            <option value="licenciatura">Licenciatura</option>
            <option value="bacharelado">Bacharelado</option>
            <option value="pos_graduacao">Pós-Graduação</option>
            <option value="docente_pesquisador">Docente/Pesquisador</option>
          </select>

          <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue/50 transition-all">
            <input
              type="text"
              placeholder="UID ESPECÍFICO"
              value={uidInput}
              onChange={(e) => setUidInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setTargetUserId(uidInput)}
              className="bg-transparent px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white outline-none w-32 placeholder:text-white/20"
            />
            <button
              onClick={() => setTargetUserId(uidInput)}
              className="px-3 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center border-l border-white/10"
              title="Buscar Telemetria do Usuário"
            >
              <Search className="w-3 h-3 text-brand-blue" />
            </button>
            {targetUserId && (
              <button
                onClick={() => { setTargetUserId(''); setUidInput(''); }}
                className="px-3 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red transition-colors flex items-center justify-center border-l border-white/10"
                title="Limpar Filtro de Usuário"
              >
                <div className="w-3 h-3 flex items-center justify-center font-black text-[10px]">X</div>
              </button>
            )}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-widest">CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs Internal Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 self-start">
        {[
          { id: 'geral', label: 'Visão Geral', icon: LayoutGrid },
          { id: 'ux', label: 'UX & Fricção', icon: Zap },
          { id: 'valor', label: 'Adoção & Valor', icon: Heart },
          { id: 'eficiencia', label: 'Eficiência de Formato', icon: BarChart3 },
          { id: 'empolgados', label: 'Empolgados', icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area (Bento Tabs) */}
      <div className="space-y-8 min-h-[600px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <span className="material-symbols-outlined text-4xl animate-spin text-brand-blue">progress_activity</span>
             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Calculando Matriz...</p>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'geral' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Eventos Totais', value: kpis.totalEvents, subtext: 'Registros', icon: Activity, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
                    { label: 'Sessões Únicas', value: kpis.uniqueUsers, subtext: 'Visitantes', icon: Users, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' },
                    { label: 'Sucesso na Busca', value: `${kpis.searchSuccessRate}%`, subtext: `de ${kpis.totalSearches} buscas totais`, icon: Search, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Tempo Médio (s)', value: kpis.avgTime, subtext: 'Por sessão', icon: Clock, color: 'text-brand-red', bg: 'bg-brand-red/10' },
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white/[0.03] p-6 rounded-[32px] border border-white/5 shadow-xl">
                      <div className={`w-10 h-10 ${card.bg} rounded-xl mb-4 flex items-center justify-center`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <div className="text-2xl font-black text-white">{card.value}</div>
                      <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{card.label}</div>
                      <div className="text-[10px] font-medium text-gray-600 mt-1">{card.subtext}</div>
                    </div>
                  ))}
                </div>
                
                <div className="lg:col-span-1 bg-white/[0.03] p-8 rounded-[40px] border border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-brand-red" />
                    Engajamento p/ Depto
                  </h3>
                  <TelemetryCharts data={deptEngagement} type="pie" />
                </div>

                <div className="lg:col-span-3 bg-white/[0.03] p-8 rounded-[40px] border border-white/5">
                  <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                    <BarChart3 className="w-3 h-3 text-brand-blue" />
                    Dinamismo da Jornada
                  </h3>
                  <TelemetryCharts data={eventTypeData} type="bar" />
                </div>
              </div>
            )}

            {activeTab === 'ux' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                          <MousePointer2 className="w-5 h-5 text-brand-red" />
                        </div>
                        <span className="text-3xl font-black text-white">{kpis.totalRageClicks}</span>
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Rage Clicks Acumulados</h4>
                    </div>

                    <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5 border-l-brand-yellow border-l-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center">
                          <History className="w-5 h-5 text-brand-yellow" />
                        </div>
                        <span className="text-3xl font-black text-white">{kpis.avgTtfa}ms</span>
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Avg Time to First Action</h4>
                    </div>

                    <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-brand-red" />
                        </div>
                        <span className="text-3xl font-black text-white">{kpis.formAbandonment}</span>
                      </div>
                      <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Abandono de Formulários</h4>
                    </div>
                  </div>

                  <div className="lg:col-span-1 bg-white/[0.03] p-8 rounded-[48px] border border-white/5">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Buscas Falhas</h3>
                    <p className="text-xs text-gray-500 mb-6">Termos que não retornaram resultados.</p>
                    
                    <div className="space-y-4">
                      {topFailedSearches.length > 0 ? topFailedSearches.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                          <span className="text-[11px] text-gray-300 font-bold truncate pr-4">{s.name}</span>
                          <span className="text-[10px] font-black text-brand-yellow shrink-0">{s.value}x</span>
                        </div>
                      )) : (
                        <div className="text-xs text-gray-500 italic text-center py-4">Nenhuma busca falhou.</div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-1 bg-white/[0.03] p-8 rounded-[48px] border border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Pontos de Fricção</h3>
                      <p className="text-xs text-gray-500 mb-6">Rotas com maior estresse (Rage Clicks).</p>

                      <div className="space-y-3">
                        {frictionPoints.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-6 bg-brand-red/10 rounded-lg flex items-center justify-center text-[10px] font-black text-brand-red shrink-0">{idx + 1}</div>
                              <span className="text-[10px] text-gray-300 font-bold truncate">{s.name}</span>
                            </div>
                            <span className="text-[9px] font-black text-brand-red shrink-0">{s.value}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <a 
                      href={`https://clarity.microsoft.com/projects/view/${process.env.NEXT_PUBLIC_CLARITY_ID}`}
                      target="_blank"
                      className="mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Clarity Recordings
                    </a>
                  </div>
                </div>

                {/* Matriz de Saúde da Rota */}
                <div className="bg-white/[0.02] p-10 rounded-[48px] border border-white/5 shadow-2xll relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <Activity className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Matriz de Saúde da Rota</h3>
                      <p className="text-xs text-gray-500">Correlação entre Tempo Médio e Fricção.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                     {routeHealth.map((r, idx) => (
                        <div key={idx} className={`p-5 rounded-[32px] border ${r.color} flex flex-col gap-4 transition-all duration-300`}>
                           <div className="flex justify-between items-start">
                              <span className="text-xs font-bold text-gray-300 break-all pr-2" title={r.path}>{r.path}</span>
                           </div>
                           <div className="flex gap-6 mt-auto">
                             <div>
                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Tempo</div>
                                <div className="text-xl font-black text-white">{r.avgRouteTime}s</div>
                             </div>
                             <div>
                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Rage</div>
                                <div className="text-xl font-black text-white">{r.rageCount}</div>
                             </div>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'valor' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 <div className="lg:col-span-1 bg-gradient-to-br from-brand-blue/20 to-transparent p-8 rounded-[40px] border border-brand-blue/20 flex flex-col justify-center items-center text-center">
                    <div className="text-6xl font-black text-white mb-2">{kpis.csat}%</div>
                    <div className="text-xs font-black uppercase text-brand-blue tracking-widest mb-4">CSAT</div>
                    <div className="flex gap-1">
                       {[1,2,3,4,5].map(i => <Heart key={i} className={`w-3 h-3 ${i <= (kpis.csat/20) ? 'text-brand-yellow fill-brand-yellow' : 'text-gray-700'}`} />)}
                    </div>
                 </div>

                 <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5">
                      <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Share2 className="w-3 h-3 text-brand-yellow" />
                        Valor Extraído Ativo
                      </h3>
                      <div className="space-y-6">
                        {adoptionMetrics.map((m, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                              <span className="text-gray-400">{m.name}</span>
                              <span className="text-white">{m.value}</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-blue" style={{ width: `${Math.min(100, (m.value / 50) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5">
                     <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 flex items-center gap-2">
                       <ThumbsUp className="w-3 h-3 text-green-500" />
                       Conteúdo "Padrão Ouro"
                     </h3>
                     <div className="space-y-4">
                        {usefulPosts.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-green-500/5 rounded-xl border border-green-500/10">
                            <span className="text-[10px] font-bold text-gray-300 truncate max-w-[140px]">{p.title}</span>
                            <span className="text-[10px] font-black text-green-500">{p.score}% útil</span>
                          </div>
                        ))}
                     </div>
                   </div>
                 </div>
              </div>
            )}

            {activeTab === 'eficiencia' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5 flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Tempo Médio p/ Formato</h3>
                    <TelemetryCharts data={formatPerformance} type="bar" />
                  </div>

                  <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5 flex flex-col">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">KPI de Engajamento</h3>
                    <TelemetryCharts data={engagementByFormat} type="pie" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-1 bg-white/[0.03] p-8 rounded-[40px] border border-white/5">
                      <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6 shadow-sm">Funil de Áudio</h3>
                      <div className="space-y-6">
                        {audioFunnelData.map((f, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] font-black text-white uppercase">{f.name}</span>
                              <span className="text-xl font-black text-brand-red">{f.value}</span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-brand-red opacity-50" style={{ width: `${Math.min(100, playCount > 0 ? (f.value / playCount) * 100 : 0)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="lg:col-span-2 bg-gradient-to-br from-brand-blue/10 to-transparent p-10 rounded-[48px] border border-white/5">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Carga Cognitiva</h3>
                      <p className="text-xs text-gray-500 mb-8 max-w-lg">Tempo em Página (s) / Contagem de Palavras.</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cognitiveLoadData.map((d, idx) => (
                          <div key={idx} className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                            <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">{d.name}</div>
                            <div className="text-3xl font-black text-white">{d.value}</div>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'empolgados' && (
              <div className="bg-white/[0.03] p-10 rounded-[48px] border border-white/5 shadow-2xl">
                <div className="flex items-center gap-4 mb-10">
                  <Trophy className="w-8 h-8 text-brand-yellow" />
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">O Olimpo do USP</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {topUsers.map((user, idx) => (
                    <div key={user.id} className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5 group">
                      <div className="flex items-center gap-6">
                        <div className="text-xl font-black text-gray-600 italic">#{idx + 1}</div>
                        <div>
                          <div className="text-sm font-black text-white">{user.name}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-brand-blue">{user.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xl font-black text-white">{user.count}</div>
                          <div className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Ações</div>
                        </div>
                        <button
                          onClick={() => {
                            setUidInput(user.id);
                            setTargetUserId(user.id);
                            setActiveTab('geral');
                            toast.success(`Filtrando dados para: ${user.name}`);
                          }}
                          className="px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                        >
                          Analisar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw Logs Table */}
      <div className="bg-white/[0.03] p-8 rounded-[40px] border border-white/5 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
              <History className="w-4 h-4 text-brand-blue" />
              Logs Resumidos
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-[10px] font-black text-gray-500 uppercase">PÁG {page + 1}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={paginatedEvents.length < pageSize} className="disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[9px] font-black uppercase tracking-widest text-gray-600 border-b border-white/5">
                <tr>
                  <th className="pb-4 px-2">Tipo</th>
                  <th className="pb-4 px-2">Local / URL</th>
                  <th className="pb-4 px-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {paginatedEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 px-2 text-[10px] font-black text-brand-blue">{e.event_type}</td>
                    <td className="py-4 px-2 text-[11px] font-bold text-gray-400 truncate max-w-[200px]">{e.url || '/fluxo'}</td>
                    <td className="py-4 px-2 text-right">
                      <button 
                        onClick={() => toast(JSON.stringify(e.metadata, null, 2), { duration: 3000 })}
                        className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-brand-blue"
                      >
                        <FileJson className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
