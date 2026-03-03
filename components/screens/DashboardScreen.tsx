import React, { useState } from 'react';
import { ViewState, UserContextType, MovementItem } from '../../types';
import { StatusBar, ActionCard } from '../ui/Shared';
import { Plus, Calendar, List, User, LogOut, Plane, ChevronRight, CreditCard, Users, Smartphone, LayoutGrid, ArrowDownLeft, ArrowUpRight, Zap, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: UserContextType;
  changeView: (view: ViewState) => void;
  setMovement: (item: MovementItem) => void;
  setPreviousView: (view: ViewState) => void;
  setSelectedAccount: (account: any) => void;
  movements: MovementItem[];
}

export const DashboardScreen: React.FC<DashboardProps> = ({ user, changeView, setMovement, setPreviousView, setSelectedAccount, movements }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper to navigate to detail
  const handleMovementClick = (movement: MovementItem) => {
      setMovement(movement);
      setPreviousView(ViewState.DASHBOARD); // Set history to Dashboard
      changeView(ViewState.MOVEMENT_DETAIL);
  };

  const handleAccountClick = (account: any) => {
    setSelectedAccount(account);
    changeView(ViewState.MOVEMENTS_LIST);
  };

  const handleAccountTap = (index: number, account: any) => {
    if (activeIndex === index) {
      handleAccountClick(account);
    } else {
      setActiveIndex(index);
    }
  };

  // Get 3 most recent movements
  const recentMovements = movements.slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header Section */}
      <div className="bg-indigo-600 text-white pt-2 pb-8 rounded-b-[2.5rem] shadow-xl">
        <div className="px-6 mb-4">
            {/* Custom Status Bar for Dark BG */}
            <div className="flex justify-between items-center py-3 text-white">
                <span className="font-semibold text-sm">9:41</span>
                <div className="flex items-center gap-1.5 opacity-90">
                    <div className="w-4 h-4 border border-white/50 rounded-sm flex items-end justify-center gap-[1px] p-[1px]">
                         <div className="w-[2px] h-[3px] bg-white"></div>
                         <div className="w-[2px] h-[5px] bg-white"></div>
                         <div className="w-[2px] h-[7px] bg-white"></div>
                    </div>
                    <div className="w-5 h-3 border border-white/50 rounded-sm relative">
                        <div className="absolute inset-[1px] bg-white rounded-[1px] w-2/3"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="px-6 flex justify-between items-start mb-6">
          <div>
            <h3 className="font-medium opacity-90 text-indigo-100">Banco Confía</h3>
            <h1 className="text-3xl font-bold">Hola, {user.name}</h1>
            <p className="text-indigo-200 text-sm">Bienvenido de nuevo</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => changeView(ViewState.LOGIN_METHODS)}
              className="w-10 h-10 bg-red-500/20 border border-red-400/30 rounded-full flex items-center justify-center hover:bg-red-500/30 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5 text-red-200" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 flex-1 overflow-y-auto no-scrollbar pb-6">
        {/* Accounts Sliding Selector */}
        <div className="relative overflow-hidden -mx-6 px-6 mb-6">
          <motion.div 
            className="flex gap-4"
            animate={{ x: activeIndex === 0 ? 0 : -240 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {user.accounts.map((acc, idx) => (
              <motion.div 
                key={acc.id}
                onClick={() => handleAccountTap(idx, acc)}
                animate={{ 
                  scale: activeIndex === idx ? 1 : 0.9,
                  opacity: activeIndex === idx ? 1 : 0.5,
                }}
                className={`bg-white p-6 rounded-3xl shadow-lg shrink-0 w-[280px] cursor-pointer transition-all ${activeIndex === idx ? 'ring-2 ring-indigo-500/20' : ''}`}
              >
                  <div className="mb-2">
                      <span className="text-slate-500 font-bold text-sm">{acc.name}</span>
                      <p className="text-slate-400 text-xs">**** {acc.number.slice(-4)}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                      <span className="text-slate-900 text-3xl font-extrabold">S/ {acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-slate-400 text-sm">Saldo disponible</p>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {user.accounts.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${activeIndex === idx ? 'w-4 bg-indigo-600' : 'bg-slate-300'}`}
                aria-label={`Ver cuenta ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Travel Banner */}
        <button 
          onClick={() => changeView(ViewState.TRAVEL_MAIN)}
          className="w-full bg-indigo-600 rounded-3xl p-5 mb-8 flex items-center gap-4 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all group"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plane className="w-6 h-6" />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-bold text-lg">¿Me voy de viaje?</h4>
            <p className="text-indigo-100 text-xs">Registra tu destino y usa tus tarjetas sin problemas.</p>
          </div>
          <ChevronRight className="w-6 h-6 text-white/50" />
        </button>

        {/* Quick Actions */}
        <h3 className="font-bold text-lg text-slate-900 mb-4">Acciones rápidas</h3>
        <div className="grid grid-cols-3 gap-4 mb-8">
            <button 
                onClick={() => changeView(ViewState.TRANSFER_MENU)}
                className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
            >
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <ArrowRightLeft className="w-7 h-7" />
                </div>
                <div className="text-center">
                    <span className="block font-bold text-slate-900 text-sm">Transferir</span>
                    <span className="block text-xs text-slate-400">Enviar dinero</span>
                </div>
            </button>
            <button 
                onClick={() => changeView(ViewState.PAYMENT_MENU)}
                className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
            >
                <div className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <Zap className="w-7 h-7" />
                </div>
                <div className="text-center">
                    <span className="block font-bold text-slate-900 text-sm">Pagar</span>
                    <span className="block text-xs text-slate-400">Servicios</span>
                </div>
            </button>
            <button 
                onClick={() => changeView(ViewState.MOVEMENTS_LIST)}
                className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors"
            >
                <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <LayoutGrid className="w-7 h-7" />
                </div>
                <div className="text-center">
                    <span className="block font-bold text-slate-900 text-sm leading-tight">Movimientos</span>
                    <span className="block text-xs text-slate-400">Ver historial</span>
                </div>
            </button>
        </div>

        {/* Recent Movements */}
        <h3 className="font-bold text-lg text-slate-900 mb-4">Últimos movimientos</h3>
        <div className="flex flex-col gap-4">
            {recentMovements.map((m) => {
                const isIncome = m.amount > 0;
                return (
                    <div 
                        key={m.id}
                        onClick={() => handleMovementClick(m)}
                        className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer active:bg-slate-50 transition-colors"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}>
                            {isIncome ? (
                                <ArrowDownLeft className="w-6 h-6" />
                            ) : (
                                m.type === 'payment' ? <Zap className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm text-slate-900">{m.title} - {m.subtitle}</h4>
                            <span className="text-slate-400 text-xs">{m.dateLabel}</span>
                        </div>
                        <div className="text-right">
                            <span className={`block font-bold ${isIncome ? 'text-emerald-500' : 'text-slate-900'}`}>
                                {isIncome ? '+' : '-'}S/ {Math.abs(m.amount).toFixed(2)}
                            </span>
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {isIncome ? 'Abono' : 'Cargo'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
        
        <div className="text-center mt-6">
            <button onClick={() => changeView(ViewState.MOVEMENTS_LIST)} className="text-indigo-600 font-semibold">Ver todos</button>
        </div>
      </div>
    </div>
  );
};