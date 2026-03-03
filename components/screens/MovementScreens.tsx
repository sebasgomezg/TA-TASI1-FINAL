import React, { useState, useEffect } from 'react';
import { ViewState, MovementItem, UserContextType, Account } from '../../types';
import { Header, Button } from '../ui/Shared';
import { Plus, List, MoreHorizontal, ChevronRight, Check, ChevronDown, Search, Share2, MessageCircle, Mail, Send, Copy, X, ArrowDownLeft, ArrowUpRight, Zap, Calendar, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MovementProps {
  changeView: (view: ViewState) => void;
  setMovement: (item: MovementItem) => void;
  movement: MovementItem | null;
  user: UserContextType;
  setPreviousView?: (view: ViewState) => void;
  previousView?: ViewState;
  selectedAccount: Account;
  setSelectedAccount: (account: Account) => void;
  movements: MovementItem[];
}

type DateFilter = 'all' | 'month' | 'today' | 'custom';

export const MovementsListScreen: React.FC<MovementProps> = ({ changeView, setMovement, user, setPreviousView, selectedAccount, setSelectedAccount, movements }) => {
    const [showAccountSelector, setShowAccountSelector] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedShareAccounts, setSelectedShareAccounts] = useState<string[]>([selectedAccount.id]);
    const [selectedShareMethod, setSelectedShareMethod] = useState<string>('WhatsApp');
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<DateFilter>('month');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [dateError, setDateError] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (showSuccessToast) {
            const timer = setTimeout(() => setShowSuccessToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessToast]);

    const handleMovementClick = (m: MovementItem) => {
        setMovement(m);
        if (setPreviousView) setPreviousView(ViewState.MOVEMENTS_LIST);
        changeView(ViewState.MOVEMENT_DETAIL);
    };

    // Filtering Logic
    const filteredMovements = movements.filter(item => {
        // 1. Filter by Account (Consistent with selector)
        if (item.account !== selectedAccount.name) return false;

        // 2. Filter by Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const matches = item.title.toLowerCase().includes(term) || item.subtitle.toLowerCase().includes(term);
            if (!matches) return false;
        }

        // 3. Filter by Date
        if (dateFilter === 'today') {
            return item.date === today;
        }
        if (dateFilter === 'month') {
            // Last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return new Date(item.date + 'T00:00:00') >= thirtyDaysAgo;
        }
        if (dateFilter === 'custom' && customStartDate && customEndDate) {
            const itemDate = new Date(item.date + 'T00:00:00');
            const start = new Date(customStartDate + 'T00:00:00');
            const end = new Date(customEndDate + 'T23:59:59');
            return itemDate >= start && itemDate <= end;
        }

        return true;
    });

    // Grouping for display - Group by date to ensure all movements are shown
    const groupedMovements: { [key: string]: { label: string, items: MovementItem[] } } = {};
    
    filteredMovements.forEach(m => {
        const dateKey = m.date;
        if (!groupedMovements[dateKey]) {
            groupedMovements[dateKey] = {
                label: m.dateLabel,
                items: []
            };
        }
        groupedMovements[dateKey].items.push(m);
    });

    // Sort dates descending
    const sortedDateKeys = Object.keys(groupedMovements).sort((a, b) => b.localeCompare(a));

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
            <Header 
                title="Movimientos" 
                onBack={() => changeView(ViewState.DASHBOARD)} 
                actions={
                    <button 
                        onClick={() => setShowShareModal(true)}
                        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                }
            />
            
            <div className="px-6 py-4 flex-1 overflow-y-auto no-scrollbar">
                
                {/* Account Selector */}
                <div 
                    onClick={() => setShowAccountSelector(true)}
                    className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center mb-4 cursor-pointer border border-transparent hover:border-indigo-100 transition-all"
                >
                    <div>
                        <p className="text-slate-500 font-bold text-xs mb-1">Cuenta seleccionada</p>
                        <p className="font-bold text-slate-900">{selectedAccount.name} **** {selectedAccount.number.slice(-4)}</p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>

                {/* Search Bar & Filter */}
                <div className="flex gap-2 mb-6">
                    <div className="flex-1 bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-slate-100">
                        <Search className="w-5 h-5 text-slate-400 ml-2" />
                        <input 
                            placeholder="Buscar movimientos..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full outline-none text-slate-900 placeholder:text-slate-400 font-medium bg-transparent"
                        />
                    </div>
                    <button 
                        onClick={() => setShowFilterModal(true)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border transition-all ${dateFilter !== 'all' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* List */}
                <div className="space-y-6 pb-20">
                    {sortedDateKeys.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-400">No se encontraron movimientos.</p>
                        </div>
                    ) : (
                        sortedDateKeys.map(dateKey => {
                            const group = groupedMovements[dateKey];
                            return (
                                <div key={dateKey}>
                                    <h3 className="font-bold text-lg text-slate-900 mb-4">{group.label}</h3>
                                    {group.items.map(m => (
                                        <MovementItemRow key={m.id} item={m} onClick={() => handleMovementClick(m)} />
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

             {/* Filter Modal */}
             <AnimatePresence>
                {showFilterModal && (
                    <div className="absolute inset-0 z-[60] flex items-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
                            onClick={() => setShowFilterModal(false)}
                        ></motion.div>
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white w-full rounded-t-[2.5rem] p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
                        >
                            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
                            <h3 className="font-bold text-xl text-slate-900 mb-6">Filtrar movimientos</h3>
                            
                            <div className="space-y-4 mb-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Período</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'today', label: 'Hoy' },
                                        { id: 'month', label: 'Último mes' },
                                        { id: 'all', label: 'Todos' },
                                        { id: 'custom', label: 'Personalizado' }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setDateFilter(option.id as DateFilter);
                                                if (option.id !== 'custom') {
                                                    setShowFilterModal(false);
                                                }
                                            }}
                                            className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all border-2 ${dateFilter === option.id ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-slate-100 text-slate-500'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>

                                {dateFilter === 'custom' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-4 pt-4 border-t border-slate-100"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Desde</label>
                                                <input 
                                                    type="date" 
                                                    value={customStartDate}
                                                    max={today}
                                                    onChange={(e) => {
                                                        setCustomStartDate(e.target.value);
                                                        setDateError(null);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Hasta</label>
                                                <input 
                                                    type="date" 
                                                    value={customEndDate}
                                                    max={today}
                                                    min={customStartDate}
                                                    onChange={(e) => {
                                                        setCustomEndDate(e.target.value);
                                                        setDateError(null);
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        {dateError && (
                                            <p className="text-red-500 text-xs font-bold ml-1">{dateError}</p>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        setCustomStartDate('');
                                        setCustomEndDate('');
                                        setDateFilter('all');
                                        setDateError(null);
                                        setShowFilterModal(false);
                                    }}
                                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100"
                                >
                                    Limpiar
                                </button>
                                <button 
                                    onClick={() => {
                                        if (dateFilter === 'custom') {
                                            if (!customStartDate || !customEndDate) {
                                                setDateError('Selecciona ambas fechas');
                                                return;
                                            }
                                            if (customEndDate < customStartDate) {
                                                setDateError('La fecha "Hasta" no puede ser menor a "Desde"');
                                                return;
                                            }
                                            if (customEndDate > today || customStartDate > today) {
                                                setDateError('No se permiten fechas futuras');
                                                return;
                                            }
                                        }
                                        setShowFilterModal(false);
                                    }}
                                    className="flex-1 py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                >
                                    Aplicar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
             </AnimatePresence>

             {/* Account Selector Modal */}
             {showAccountSelector && (
                <div className="absolute inset-0 z-50 flex items-end">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
                        onClick={() => setShowAccountSelector(false)}
                    ></motion.div>
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white w-full rounded-t-[2.5rem] p-6 relative z-10 shadow-2xl"
                    >
                        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Selecciona una cuenta</h3>
                        
                        <div className="space-y-4 mb-6">
                            {user.accounts.map(acc => (
                                <div 
                                    key={acc.id}
                                    onClick={() => {
                                        setSelectedAccount(acc);
                                        setShowAccountSelector(false);
                                    }}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                                        selectedAccount.id === acc.id 
                                        ? 'border-indigo-600 bg-indigo-50' 
                                        : 'border-slate-100 hover:border-slate-300'
                                    }`}
                                >
                                    <div>
                                        <p className="font-bold text-slate-900">{acc.name}</p>
                                        <p className="text-slate-500 text-sm">**** {acc.number.slice(-4)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">S/ {acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2})}</p>
                                        {selectedAccount.id === acc.id && (
                                            <div className="flex justify-end mt-1">
                                                <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <Button variant="secondary" onClick={() => setShowAccountSelector(false)}>Cancelar</Button>
                    </motion.div>
                </div>
            )}

            {/* Share Account Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <div className="absolute inset-0 z-50 flex items-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
                            onClick={() => setShowShareModal(false)}
                        ></motion.div>
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-white w-full rounded-t-[2.5rem] p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
                        >
                            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
                            
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Compartir datos de cuenta</h2>
                                    <p className="text-slate-400 text-sm">Elige la cuenta y cómo quieres enviarla</p>
                                </div>
                                <button 
                                    onClick={() => setShowShareModal(false)}
                                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mt-6">
                                <div className="space-y-3">
                                    {user.accounts.map(acc => {
                                        const isSelected = selectedShareAccounts.includes(acc.id);
                                        return (
                                            <div 
                                                key={acc.id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedShareAccounts(prev => prev.filter(id => id !== acc.id));
                                                    } else {
                                                        setSelectedShareAccounts(prev => [...prev, acc.id]);
                                                    }
                                                }}
                                                className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100'}`}
                                            >
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs ${acc.name.includes('Sueldo') ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {acc.name.includes('Sueldo') ? 'S/' : '$'}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900">{acc.name}</p>
                                                    <p className="text-slate-400 text-xs">•••• {acc.number.slice(-4)} · S/ {acc.balance.toLocaleString()}</p>
                                                    <p className="text-slate-300 text-[10px] mt-0.5">Comparte: Nº cuenta · CCI · Alias</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between gap-2">
                                    {[
                                        { id: 'WhatsApp', icon: <MessageCircle className="w-6 h-6" />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                        { id: 'Email', icon: <Mail className="w-6 h-6" />, color: 'text-blue-500', bg: 'bg-blue-50' },
                                        { id: 'Telegram', icon: <Send className="w-6 h-6" />, color: 'text-sky-500', bg: 'bg-sky-50' },
                                        { id: 'Copiar', icon: <Copy className="w-6 h-6" />, color: 'text-pink-500', bg: 'bg-pink-50' },
                                        { id: 'Más', icon: <MoreHorizontal className="w-6 h-6" />, color: 'text-slate-400', bg: 'bg-slate-50' }
                                    ].map(method => (
                                        <div key={method.id} className="flex flex-col items-center gap-2">
                                            <button 
                                                onClick={() => setSelectedShareMethod(method.id)}
                                                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative ${selectedShareMethod === method.id ? 'ring-2 ring-indigo-600 ring-offset-2' : ''} ${method.bg} ${method.color}`}
                                            >
                                                {method.icon}
                                                {selectedShareMethod === method.id && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </button>
                                            <span className={`text-[10px] font-bold ${selectedShareMethod === method.id ? 'text-indigo-600' : 'text-slate-400'}`}>{method.id}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
                                <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold">i</span>
                                </div>
                                <p className="text-blue-700 text-[11px] leading-relaxed">
                                    Solo se comparte Nº cuenta, CCI y alias. <br />
                                    <span className="font-bold">Nunca tu saldo ni contraseña.</span>
                                </p>
                            </div>

                            <div className="mt-8">
                                <Button 
                                    disabled={selectedShareAccounts.length === 0 || selectedShareMethod === 'Más'}
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setShowSuccessToast(true);
                                    }}
                                >
                                    Compartir
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccessToast && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="absolute bottom-10 left-6 right-6 z-[100]"
                    >
                        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                                <Check className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">
                                    {selectedShareMethod === 'Copiar' 
                                        ? '¡Datos copiados!' 
                                        : `¡Datos enviados por ${selectedShareMethod}!`}
                                </h4>
                                <p className="text-slate-400 text-[10px]">Cuenta Sueldo · Nº cuenta, CCI y alias</p>
                            </div>
                            <button onClick={() => setShowSuccessToast(false)}>
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MovementItemRow: React.FC<{ item: MovementItem, onClick: () => void }> = ({ item, onClick }) => {
    const isIncome = item.amount > 0;
    
    return (
        <div onClick={onClick} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 mb-3 cursor-pointer active:scale-[0.99] transition-transform">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}>
                {isIncome 
                    ? <ArrowDownLeft className="w-6 h-6" /> 
                    : (item.type === 'payment' ? <Zap className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />)
                }
             </div>
             <div className="flex-1">
                 <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                 <div className="flex flex-col">
                    <span className="text-slate-500 text-xs font-medium">{item.subtitle}</span>
                    <span className="text-slate-300 text-[10px]">{item.time}</span>
                 </div>
             </div>
             <div className="text-right">
                 <span className={`block font-bold text-base ${isIncome ? 'text-emerald-500' : 'text-slate-900'}`}>
                    {isIncome ? '+' : '-'}S/ {Math.abs(item.amount).toFixed(2)}
                 </span>
                 <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                     {isIncome ? 'Abono' : 'Cargo'}
                 </span>
             </div>
        </div>
    );
}

export const MovementDetailScreen: React.FC<MovementProps> = ({ changeView, movement, previousView }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [selectedShare, setSelectedShare] = useState('whatsapp');

    if (!movement) return null;
    const isIncome = movement.amount > 0;

    const handleShare = () => {
        setShowShareModal(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
    };

    const shareOptions = [
        { id: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-500', borderColor: 'border-emerald-500' },
        { id: 'email', name: 'Email', icon: <Mail className="w-6 h-6" />, color: 'bg-blue-50 text-blue-500', borderColor: 'border-blue-500' },
        { id: 'telegram', name: 'Telegram', icon: <Send className="w-6 h-6" />, color: 'bg-sky-50 text-sky-500', borderColor: 'border-sky-500' },
        { id: 'copy', name: 'Copiar', icon: <Copy className="w-6 h-6" />, color: 'bg-pink-50 text-pink-500', borderColor: 'border-pink-500' },
        { id: 'more', name: 'Más', icon: <MoreHorizontal className="w-6 h-6" />, color: 'bg-slate-50 text-slate-500', borderColor: 'border-slate-500' },
    ];

    return (
        <div className="flex flex-col h-full bg-white relative">
            <Header title="Detalle" onBack={() => changeView(previousView || ViewState.MOVEMENTS_LIST)} />
            
            {/* Success Toast */}
             {showSuccessToast && (
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                    <span className="font-bold text-sm">Comprobante compartido con éxito</span>
                 </div>
             )}

            <div className="px-6 pt-4 flex-1 overflow-y-auto no-scrollbar flex flex-col items-center">
                 <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 ${isIncome ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}>
                    {isIncome ? (
                        <ArrowDownLeft className="w-14 h-14" />
                    ) : (
                        movement.type === 'payment' ? <Zap className="w-14 h-14" /> : <ArrowUpRight className="w-14 h-14" />
                    )}
                 </div>

                 <h1 className={`text-4xl font-extrabold mb-1 ${isIncome ? 'text-emerald-500' : 'text-slate-900'}`}>
                    {isIncome ? '+' : '-'}S/ {Math.abs(movement.amount).toFixed(2)}
                 </h1>
                 <p className={`font-bold text-sm mb-8 ${isIncome ? 'text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full' : 'text-slate-500'}`}>
                    {movement.title}
                 </p>

                 <div className="bg-slate-50 w-full rounded-2xl p-6 mb-8">
                     <div className="mb-6">
                         <p className="text-slate-500 font-bold text-xs mb-1">Remitente</p>
                         <p className="font-bold text-slate-900 text-lg">{movement.subtitle}</p>
                     </div>

                     <div className="border-t border-slate-200 my-4"></div>

                     <div className="mb-4">
                         <p className="text-slate-500 font-bold text-xs mb-1">Cuenta origen</p>
                         <p className="font-bold text-slate-900">**** 1122</p>
                     </div>

                     <div className="border-t border-slate-200 my-4"></div>

                     <div className="mb-4">
                         <p className="text-slate-500 font-bold text-xs mb-1">Cuenta destino</p>
                         <p className="font-bold text-slate-900">Cuenta Sueldo **** 4321</p>
                     </div>

                     <div className="border-t border-slate-200 my-4"></div>

                     <div>
                         <p className="text-slate-500 font-bold text-xs mb-1">Fecha y hora</p>
                         <p className="font-bold text-slate-900">05 Feb 2026, {movement.time}</p>
                     </div>
                 </div>

                 <button 
                    onClick={() => setShowShareModal(true)}
                    className="w-full border border-slate-200 rounded-2xl py-4 px-4 flex items-center justify-center gap-2 font-bold text-slate-900 hover:bg-slate-50 mb-6 transition-colors"
                 >
                     <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-xl font-light">+</div>
                     Compartir comprobante
                 </button>
            </div>

            {/* Share Modal */}
             {showShareModal && (
                 <div className="absolute inset-0 z-50 flex items-end justify-center animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
                    <div className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-12 relative z-10 animate-in slide-in-from-bottom-full duration-500">
                        <button 
                            onClick={() => setShowShareModal(false)}
                            className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex justify-between items-start mb-10 mt-4">
                            {shareOptions.map((option) => (
                                <div 
                                    key={option.id} 
                                    className="flex flex-col items-center gap-2 cursor-pointer group"
                                    onClick={() => setSelectedShare(option.id)}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all relative ${option.color} ${selectedShare === option.id ? `ring-2 ring-offset-2 ring-indigo-500 border-2 ${option.borderColor}` : 'border border-transparent'}`}>
                                        {option.icon}
                                        {selectedShare === option.id && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white">
                                                <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[11px] font-bold ${selectedShare === option.id ? 'text-indigo-600' : 'text-slate-400'}`}>{option.name}</span>
                                </div>
                            ))}
                        </div>

                        <Button onClick={handleShare}>Compartir</Button>
                    </div>
                 </div>
             )}
        </div>
    );
};