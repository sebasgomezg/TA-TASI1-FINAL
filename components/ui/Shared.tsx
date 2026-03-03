import React from 'react';
import { ArrowLeft, Battery, Signal, Wifi, ChevronRight, X, Loader2, Home, ArrowRightLeft, CreditCard, User, LayoutGrid, Zap } from 'lucide-react';
import { ViewState } from '../../types';
import { motion } from 'motion/react';

// --- Status Bar ---
export const StatusBar: React.FC = () => {
  return (
    <div className="flex justify-between items-center px-6 py-3 bg-transparent text-slate-900">
      <span className="font-semibold text-sm">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <Battery className="w-5 h-5 rotate-90" />
      </div>
    </div>
  );
};

// --- Header ---
interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, showBack = true, className = "", actions }) => {
  return (
    <div className={`flex items-center justify-between px-6 py-4 ${className}`}>
      {showBack && (
        <button 
          onClick={onBack} 
          className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      {!showBack && <div className="w-10" />} {/* Spacer */}
      
      {title && <h1 className="text-xl font-bold text-slate-900">{title}</h1>}
      
      <div className="w-10 flex justify-end">
        {actions}
      </div>
    </div>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-4 px-6 rounded-2xl font-semibold transition-all text-center flex items-center justify-center";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-200",
    secondary: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    ghost: "bg-transparent text-indigo-600 hover:bg-indigo-50",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Keypad ---
interface KeypadProps {
  onPress: (val: string) => void;
  onDelete: () => void;
  onForgot?: () => void;
  showForgot?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({ onPress, onDelete, onForgot, showForgot = true }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-xs mx-auto mt-8">
      <div className="grid grid-cols-3 gap-y-6 gap-x-8 mb-8">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => onPress(k)}
            className="w-16 h-16 rounded-full bg-slate-100 text-2xl font-bold text-slate-900 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all"
          >
            {k}
          </button>
        ))}
        {/* Empty slot */}
        <div /> 
        <button
          onClick={() => onPress('0')}
          className="w-16 h-16 rounded-full bg-slate-100 text-2xl font-bold text-slate-900 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all"
        >
          0
        </button>
        <button
          onClick={onDelete}
          className="w-16 h-16 rounded-full text-slate-900 flex items-center justify-center hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      {showForgot && (
        <div className="flex justify-center">
          <button onClick={onForgot} className="text-indigo-600 font-semibold text-sm">
            Olvidé mi PIN
          </button>
        </div>
      )}
    </div>
  );
};

// --- Pin Dots ---
export const PinDots: React.FC<{ length: number, filled: number, isError?: boolean }> = ({ length = 6, filled, isError }) => {
  return (
    <div className="flex justify-center gap-4 my-8">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full transition-colors duration-200 ${
            i < filled 
              ? (isError ? 'bg-red-500' : 'bg-indigo-500') 
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
};

// --- Input Field ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: boolean;
}

export const InputField: React.FC<InputProps> = ({ label, icon, className = "", error = false, ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className={`text-sm font-medium ${error ? 'text-red-500' : 'text-slate-500'}`}>{label}</label>}
      <div className="relative">
        <input 
          className={`w-full bg-slate-100 text-slate-900 rounded-2xl py-4 px-4 font-medium outline-none transition-all border-2 ${
            error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
            : 'border-transparent focus:ring-2 focus:ring-indigo-500'
          }`}
          {...props}
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Visual Card ---
export const VisualCard: React.FC<{ number: string }> = ({ number }) => {
  const formatted = number.match(/.{1,4}/g)?.join(' ') || number;
  return (
    <div className="relative w-full aspect-[1.6/1] bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 mb-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/3 translate-x-1/4"></div>
      
      <div className="w-12 h-8 bg-white/30 rounded-lg mb-12"></div>
      
      <div className="flex gap-3 mb-6">
        {number ? (
          <p className="text-2xl font-bold tracking-widest">{formatted}</p>
        ) : (
          [1,2,3,4].map(i => (
            <div key={i} className="flex gap-1">
              {[1,2,3,4].map(j => <div key={j} className="w-1.5 h-1.5 bg-white rounded-full"></div>)}
            </div>
          ))
        )}
      </div>
      
      <p className="text-[10px] font-bold tracking-widest opacity-80 uppercase">Número de tarjeta</p>
    </div>
  );
};

// --- Selection Card ---
export const ActionCard: React.FC<{ 
  icon: React.ReactNode, 
  title: string, 
  subtitle?: string, 
  onClick: () => void,
  bgColor?: string,
  textColor?: string
}> = ({ icon, title, subtitle, onClick, bgColor = "bg-indigo-100", textColor = "text-indigo-600" }) => (
  <div 
    onClick={onClick}
    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:bg-slate-50 transition-colors"
  >
    <div className={`w-12 h-12 rounded-full ${bgColor} ${textColor} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="text-slate-500 text-sm leading-tight">{subtitle}</p>}
    </div>
    <ChevronRight className="w-5 h-5 text-slate-400" />
  </div>
);

// --- Loading Overlay ---
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = "Procesando..." }) => {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
        <motion.div 
          className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{message}</h3>
      <p className="text-slate-500 text-sm">Esto tomará solo unos segundos, por favor no cierres la aplicación.</p>
    </div>
  );
};

// --- Bottom Navigation Bar ---
interface BottomNavProps {
  currentView: ViewState;
  changeView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, changeView }) => {
  const navItems = [
    { view: ViewState.DASHBOARD, icon: <Home className="w-6 h-6" />, label: 'Inicio' },
    { view: ViewState.TRANSFER_MENU, icon: <ArrowRightLeft className="w-6 h-6" />, label: 'Transferir' },
    { view: ViewState.PAYMENT_MENU, icon: <Zap className="w-6 h-6" />, label: 'Pagar' },
    { view: ViewState.MOVEMENTS_LIST, icon: <LayoutGrid className="w-6 h-6" />, label: 'Movimientos' },
    { view: ViewState.EDIT_PROFILE, icon: <User className="w-6 h-6" />, label: 'Perfil' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 pb-8 flex justify-between items-center z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = currentView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => changeView(item.view)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};