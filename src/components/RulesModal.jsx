import React from "react";
import { X, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target, Trophy, Flame } from "lucide-react";

export const RulesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-4 sm:p-8 text-slate-100 metal-border">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6 pr-10">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-display font-black tracking-wide text-white uppercase leading-tight">
              ¿Cómo funciona la Liga de Supervivencia?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Guía oficial de reglas, objetivos y estrategia de juego.
            </p>
          </div>
        </div>

        {/* User Prompt's Exact Example Illustrated */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-blue-500/30 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4" /> Ejemplo Sencillo Paso a Paso
            </span>
            <span className="text-xs text-slate-400">Demostración práctica</span>
          </div>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-emerald-500/30">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 font-bold text-xs">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-100">
                    <strong className="text-white">Semana 1:</strong> Escoges a <span className="text-amber-400 font-bold">Kansas City Chiefs</span>.
                  </p>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Gana
                  </span>
                </div>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  &bull; Resultado: <strong>Sigues vivo</strong> para la siguiente semana.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-emerald-500/30">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 font-bold text-xs">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-100">
                    <strong className="text-white">Semana 2:</strong> Ya no puedes volver a elegir a Kansas City. Escoges a <span className="text-blue-400 font-bold">Buffalo Bills</span>.
                  </p>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Gana
                  </span>
                </div>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  &bull; Resultado: <strong>Sigues vivo</strong> y acumulas 2 equipos bloqueados.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-amber-500/30">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 font-bold text-xs">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-100">
                    <strong className="text-white">Semana 3:</strong> Escoges a <span className="text-rose-400 font-bold">San Francisco 49ers</span>.
                  </p>
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                    <XCircle className="w-3.5 h-3.5" /> Pierde
                  </span>
                </div>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  &bull; Resultado: <strong>Pierdes 1 vida</strong> ❤️→💔 — Te quedan <strong>2 vidas</strong>. ¡Sigues en la liga!
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-rose-500/30">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 font-bold text-xs">
                ☠️
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-100">
                  <strong className="text-white">Si pierdes tus 3 vidas:</strong>
                </p>
                <p className="text-xs text-rose-400 font-semibold mt-0.5">
                  &bull; Resultado: <strong>Quedas ELIMINADO</strong> permanentemente de la liga.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Key Questions from the Prompt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-2.5 text-amber-400 font-bold">
              <Target className="w-5 h-5" />
              <h3 className="font-display text-base">¿Cuál es el objetivo?</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ser la <strong>última persona que siga viva</strong> en la liga o sobrevivir la mayor cantidad de semanas consecutivas que los demás competidores.
            </p>
          </div>

          {/* Question 2 */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60">
            <div className="flex items-center gap-2 mb-2.5 text-blue-400 font-bold">
              <Lightbulb className="w-5 h-5" />
              <h3 className="font-display text-base">¿Por qué no es tan fácil?</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Porque los favoritos pierden inesperadamente, y debes calcular si <strong>gastar tus mejores equipos al inicio</strong> o <strong>guardarlos</strong> para semanas críticas.
            </p>
          </div>

        </div>

        {/* Rules Checklist */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" /> Reglas Fundamentales
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>1 solo pick por semana:</strong> No puedes elegir a múltiples equipos en una misma jornada.</li>
            <li><strong>Sin repetición:</strong> Un equipo utilizado queda bloqueado para siempre durante toda la temporada.</li>
            <li><strong>Pick DEFINITIVO:</strong> Una vez confirmado tu pick, <strong>NO se puede cambiar</strong>. Piensa bien antes de confirmar.</li>
            <li><strong>❤️ 3 Vidas:</strong> Cada jugador empieza con <strong>3 vidas</strong>. Pierdes 1 vida si tu equipo pierde, empata, o no haces pick. <strong>Al perder las 3, quedas eliminado.</strong></li>
            <li><strong>Autenticación con Google:</strong> Cada jugador tiene un perfil único verificado para evitar duplicados en la liga.</li>
          </ul>
        </div>

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl shadow-lg shadow-amber-500/20 transition-transform transform active:scale-98"
        >
          ¡Entendido, vamos a jugar!
        </button>

      </div>
    </div>
  );
};
