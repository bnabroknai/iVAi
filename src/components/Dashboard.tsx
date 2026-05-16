import React, { useState } from "react";
import { 
  Droplets, 
  Utensils, 
  Pill, 
  Smile, 
  Zap, 
  Moon, 
  Dumbbell, 
  Focus, 
  Activity, 
  BookOpen,
  ChevronRight,
  TrendingUp,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Entry, Goal } from "../types";
import { cn } from "@/src/lib/utils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface DashboardProps {
  entries: Entry[];
  goals: Goal[];
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  hydration: { icon: Droplets, color: "text-blue-500", bg: "bg-blue-50", label: "Hydration" },
  food: { icon: Utensils, color: "text-orange-500", bg: "bg-orange-50", label: "Food" },
  medication: { icon: Pill, color: "text-purple-500", bg: "bg-purple-50", label: "Medication" },
  mood: { icon: Smile, color: "text-yellow-500", bg: "bg-yellow-50", label: "Mood" },
  energy: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50", label: "Energy" },
  sleep: { icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50", label: "Sleep" },
  exercise: { icon: Dumbbell, color: "text-green-500", bg: "bg-green-50", label: "Exercise" },
  mindfulness: { icon: Focus, color: "text-teal-500", bg: "bg-teal-50", label: "Mindfulness" },
  vitals: { icon: Activity, color: "text-red-500", bg: "bg-red-50", label: "Vitals" },
  reflection: { icon: BookOpen, color: "text-stone-500", bg: "bg-stone-50", label: "Reflection" }
};

export default function Dashboard({ entries, goals }: DashboardProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = entries.filter(e => e.timestamp?.startsWith(today));

  const getMetricData = (type: string) => {
    return todayEntries
      .filter(e => e.type === type)
      .map(e => ({
        time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: parseFloat(e.value) || 0
      }))
      .reverse();
  };

  const calculateTotal = (type: string) => {
    return todayEntries
      .filter(e => e.type === type)
      .reduce((acc, e) => acc + (parseFloat(e.value) || 0), 0);
  };

  const getGoal = (type: string) => goals.find(g => g.type === type);

  return (
    <div className="w-full max-w-2xl px-4 space-y-6 pb-20">
      <div className="flex items-center justify-between mt-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Vitals</h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ExpandableCard 
          id="hydration"
          type="hydration"
          title="Hydration"
          value={`${calculateTotal("hydration")} oz`}
          goal={getGoal("hydration")}
          data={getMetricData("hydration")}
          isExpanded={expandedSection === "hydration"}
          onToggle={() => setExpandedSection(prev => prev === "hydration" ? null : "hydration")}
        />
        
        <ExpandableCard 
          id="medication"
          type="medication"
          title="Medication"
          value={todayEntries.filter(e => e.type === "medication").length > 0 ? `${todayEntries.filter(e => e.type === "medication").length} doses` : "None"}
          goal={getGoal("medication")}
          data={getMetricData("medication")}
          isExpanded={expandedSection === "medication"}
          onToggle={() => setExpandedSection(prev => prev === "medication" ? null : "medication")}
        />

        <ExpandableCard 
          id="mood"
          type="mood"
          title="Mood"
          value={todayEntries.filter(e => e.type === "mood")[0]?.value || "N/A"}
          data={todayEntries.filter(e => e.type === "mood").map(e => ({ time: e.timestamp, value: e.value }))}
          isExpanded={expandedSection === "mood"}
          onToggle={() => setExpandedSection(prev => prev === "mood" ? null : "mood")}
        />

        <ExpandableCard 
          id="energy"
          type="energy"
          title="Energy"
          value={todayEntries.filter(e => e.type === "energy")[0]?.value || "N/A"}
          data={getMetricData("energy")}
          isExpanded={expandedSection === "energy"}
          onToggle={() => setExpandedSection(prev => prev === "energy" ? null : "energy")}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Recent Activity</h3>
        <div className="space-y-3">
          {entries.slice(0, 15).map((entry, idx) => (
            <ActivityRow key={entry.id || idx} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ExpandableCardProps {
  id: string;
  type: string;
  title: string;
  value: string;
  goal?: Goal;
  data: any[];
  isExpanded: boolean;
  onToggle: () => void;
}

function ExpandableCard({ id, type, title, value, data, goal, isExpanded, onToggle }: ExpandableCardProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const progress = goal ? Math.min(100, (parseFloat(value) / goal.targetValue) * 100) : null;

  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "cursor-pointer overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all active:scale-[0.98]",
        isExpanded ? "col-span-full ring-2 ring-blue-500 shadow-xl" : "p-4"
      )}
      onClick={onToggle}
    >
      <motion.div layout className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn("p-3 rounded-2xl", config.bg, config.color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{title}</p>
            <p className="text-xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          </div>
        </div>
        
        {progress !== null && !isExpanded && (
          <div className="relative h-12 w-12 flex items-center justify-center">
            <svg className="h-full w-full rotate-[-90deg]">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-gray-100"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={126}
                strokeDashoffset={126 - (126 * progress) / 100}
                strokeLinecap="round"
                className={config.color}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[10px] font-bold">{Math.round(progress)}%</span>
            </div>
          </div>
        )}

        {!isExpanded && (
          <ChevronRight className="h-5 w-5 text-gray-300 self-center" />
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-6 space-y-6"
          >
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={getHexColor(config.color)} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={getHexColor(config.color)} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={getHexColor(config.color)} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill={`url(#gradient-${id})`} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {goal && (
                <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col space-y-2">
                   <div className="flex items-center space-x-2 text-gray-500">
                     <Target className="h-4 w-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Goal</span>
                   </div>
                   <p className="text-sm font-bold text-gray-900">{goal.targetValue} {goal.unit} / day</p>
                </div>
              )}
               <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col space-y-2 text-blue-600">
                   <div className="flex items-center space-x-2">
                     <TrendingUp className="h-4 w-4" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Trend</span>
                   </div>
                   <p className="text-sm font-bold text-gray-900">Normal</p>
                </div>
            </div>

            <button 
              className={cn("w-full py-4 rounded-[2rem] font-bold text-sm shadow-sm active:scale-95 transition-all text-white", getBgColor(config.color))}
              onClick={(e) => {
                e.stopPropagation();
                // We'd normally open a manual entry modal here
                alert(`Manual logging for ${title} coming soon! Use voice for now.`);
              }}
            >
              Log {title} Manually
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getHexColor(twColor: string) {
  const map: Record<string, string> = {
    "text-blue-500": "#3b82f6",
    "text-orange-500": "#f97316",
    "text-purple-500": "#a855f7",
    "text-yellow-500": "#eab308",
    "text-amber-500": "#f59e0b",
    "text-indigo-500": "#6366f1",
    "text-green-500": "#22c55e",
    "text-red-500": "#ef4444"
  };
  return map[twColor] || "#3b82f6";
}

function getBgColor(twColor: string) {
  const map: Record<string, string> = {
    "text-blue-500": "bg-blue-600",
    "text-orange-500": "bg-orange-600",
    "text-purple-500": "bg-purple-600",
    "text-yellow-500": "bg-yellow-600",
    "text-amber-500": "bg-amber-600",
    "text-indigo-500": "bg-indigo-600",
    "text-green-500": "bg-green-600",
    "text-red-500": "bg-red-600"
  };
  return map[twColor] || "bg-blue-600";
}

const ActivityRow: React.FC<{ entry: Entry }> = ({ entry }) => {
  const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG.reflection;
  const Icon = config.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center space-x-4 p-4 bg-white rounded-3xl border border-gray-50 shadow-sm"
    >
      <div className={cn("p-2.5 rounded-2xl", config.bg, config.color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-bold text-gray-900 uppercase tracking-tighter">{config.label}</p>
          <p className="text-[10px] font-bold text-gray-400">
            {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <p className="text-sm font-medium text-gray-600 truncate">
          {entry.value} {entry.unit} {entry.notes && `• ${entry.notes}`}
        </p>
      </div>
    </motion.div>
  );
};
