import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function EditingSuggestions({ suggestions = [] }) {
  const priorityIcons = {
    high: AlertTriangle,
    medium: Lightbulb,
    low: CheckCircle,
  };

  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  const priorityLabels = {
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">قم بتحليل النص للحصول على اقتراحات</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {suggestions.map((suggestion, index) => {
          const Icon = priorityIcons[suggestion.priority] || Lightbulb;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${priorityColors[suggestion.priority]?.split(' ')[0] || 'bg-slate-100'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-slate-800">{suggestion.title}</h4>
                    <Badge className={`${priorityColors[suggestion.priority]} border text-xs`}>
                      {priorityLabels[suggestion.priority]}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{suggestion.description}</p>
                  {suggestion.type && (
                    <p className="text-xs text-slate-400 mt-2">{suggestion.type}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}