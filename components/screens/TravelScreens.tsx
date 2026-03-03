import React, { useState, useEffect } from 'react';
import { ViewState, UserContextType, TravelDetails } from '../../types';
import { Header, Button } from '../ui/Shared';
import { 
  Plane, 
  MapPin, 
  Calendar as CalendarIcon, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  X, 
  Search, 
  Trash2, 
  Info,
  Plus,
  Edit2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TravelProps {
  changeView: (view: ViewState) => void;
  user: UserContextType;
  travelNotices: TravelDetails[];
  setTravelNotices: React.Dispatch<React.SetStateAction<TravelDetails[]>>;
}

const COUNTRIES = [
  { id: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { id: 'bo', name: 'Bolivia', flag: '🇧🇴' },
  { id: 'br', name: 'Brasil', flag: '🇧🇷' },
  { id: 'cl', name: 'Chile', flag: '🇨🇱' },
  { id: 'co', name: 'Colombia', flag: '🇨🇴' },
  { id: 'ec', name: 'Ecuador', flag: '🇪🇨' },
  { id: 'mx', name: 'México', flag: '🇲🇽' },
  { id: 'us', name: 'EE.UU.', flag: '🇺🇸' },
  { id: 'es', name: 'España', flag: '🇪🇸' },
  { id: 'fr', name: 'Francia', flag: '🇫🇷' },
];

export const TravelMainScreen: React.FC<TravelProps> = ({ changeView, user, travelNotices, setTravelNotices }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<TravelDetails | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleOpenModal = (notice?: TravelDetails) => {
    setEditingNotice(notice || null);
    setShowModal(true);
  };

  const handleSaveNotice = (notice: TravelDetails) => {
    if (editingNotice) {
      setTravelNotices(prev => prev.map(n => n.id === editingNotice.id ? notice : n));
    } else {
      setTravelNotices(prev => [...prev, notice]);
    }
    setShowModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteNotice = (id: string) => {
    setTravelNotices(prev => prev.filter(n => n.id !== id));
    setShowModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <Header title="Aviso de viaje" onBack={() => changeView(ViewState.DASHBOARD)} />
      
      <div className="flex-1 p-6 overflow-y-auto no-scrollbar pb-24">
        {travelNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full animate-spin-slow"></div>
                <Plane className="w-20 h-20 text-indigo-400 -rotate-12" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Sin avisos activos</h2>
            <p className="text-slate-500 text-sm mb-8 max-w-[240px]">
              ¿Próximo viaje al exterior? Registra tus destinos y evita bloqueos en tus tarjetas.
            </p>
            
            <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-3 mb-8 w-full">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-indigo-700 text-xs text-left leading-relaxed">
                    Registra el aviso al menos un día antes de salir del país.
                </p>
            </div>

            <Button 
              onClick={() => handleOpenModal()}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Registrar viaje
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl flex items-start gap-3 w-full">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p className="text-indigo-700 text-xs text-left leading-relaxed">
                    Registra tu viaje para evitar bloqueos de seguridad en tus tarjetas.
                </p>
            </div>

            <div className="space-y-4">
                {travelNotices.map(notice => (
                    <div 
                        key={notice.id}
                        className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Plane className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900">
                                {notice.destination.map(id => COUNTRIES.find(c => c.id === id)?.name).join(' - ')}
                            </h4>
                            <p className="text-slate-400 text-xs">
                                {new Date(notice.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(notice.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <div className="mt-1">
                                <span className="inline-block bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded">Activo</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleOpenModal(notice)}
                                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDeleteNotice(notice.id)}
                                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={() => handleOpenModal()}
                    className="w-full border-2 border-dashed border-slate-200 rounded-3xl p-5 flex items-center justify-center gap-3 text-indigo-600 font-bold hover:bg-slate-50 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Registrar nuevo aviso
                </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <NewTripModal 
            onClose={() => setShowModal(false)} 
            onSave={handleSaveNotice}
            onDelete={handleDeleteNotice}
            user={user}
            initialData={editingNotice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-10 left-6 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100]"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm">¡Aviso registrado!</p>
                <p className="text-slate-400 text-xs">Tu viaje está protegido.</p>
            </div>
            <button onClick={() => setShowToast(false)}>
                <X className="w-5 h-5 text-slate-500" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface NewTripModalProps {
  onClose: () => void;
  onSave: (notice: TravelDetails) => void;
  onDelete: (id: string) => void;
  user: UserContextType;
  initialData: TravelDetails | null;
}

const NewTripModal: React.FC<NewTripModalProps> = ({ onClose, onSave, onDelete, user, initialData }) => {
  const [step, setStep] = useState<'form' | 'calendar' | 'countries' | 'cards' | 'confirm_delete'>('form');
  const [startDate, setStartDate] = useState(initialData?.startDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialData?.destination || []);
  const [selectedCards, setSelectedCards] = useState<string[]>(initialData?.selectedCards || []);
  const [note, setNote] = useState(initialData?.note || '');

  const isFormValid = startDate && endDate && selectedCountries.length > 0 && selectedCards.length > 0;

  const handleSave = () => {
    if (isFormValid) {
      onSave({
        id: initialData?.id || Math.random().toString(36).substr(2, 9),
        destination: selectedCountries,
        startDate,
        endDate,
        selectedCards,
        note,
        status: 'active'
      });
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validateDates = (start: string, end: string) => {
    if (!start || !end) return true;
    const s = new Date(start);
    const e = new Date(end);
    if (s < today) return false;
    if (e < s) return false;
    return true;
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm rounded-[3rem]"
      />
      
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85%]"
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {step === 'form' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Nuevo aviso de viaje</h2>
                <p className="text-slate-400 text-sm">Completa los campos para continuar</p>
              </div>

              {/* Step 1: Dates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
                    <h3 className="font-bold text-slate-900">Fechas de viaje</h3>
                </div>
                <p className="text-[11px] text-slate-500 ml-8 -mt-3">Selecciona tu fecha de ida y regreso</p>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setStep('calendar')}
                        className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${startDate ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                        <span className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Fecha de ida</span>
                        <div className="flex items-center justify-between w-full">
                            <span className={`text-sm font-medium ${startDate ? 'text-slate-900' : 'text-slate-300'}`}>
                                {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'DD / MM / AAAA'}
                            </span>
                            <CalendarIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                    </button>
                    <button 
                        onClick={() => setStep('calendar')}
                        className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${endDate ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 bg-slate-50'}`}
                    >
                        <span className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Fecha de regreso</span>
                        <div className="flex items-center justify-between w-full">
                            <span className={`text-sm font-medium ${endDate ? 'text-slate-900' : 'text-slate-300'}`}>
                                {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'DD / MM / AAAA'}
                            </span>
                            <CalendarIcon className="w-4 h-4 text-indigo-600" />
                        </div>
                    </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Info className="w-3 h-3" />
                    <span>Registra el aviso al menos 24 h antes de salir.</span>
                </div>
              </div>

              {/* Step 2: Countries */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</div>
                    <h3 className="font-bold text-slate-900">Países destino</h3>
                </div>
                <button 
                    onClick={() => setStep('countries')}
                    className={`w-full p-5 rounded-3xl border-2 border-dashed flex items-center justify-between transition-all ${selectedCountries.length > 0 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                >
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        <span className={`text-sm ${selectedCountries.length > 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                            {selectedCountries.length > 0 
                                ? selectedCountries.map(id => COUNTRIES.find(c => c.id === id)?.name).join(', ')
                                : 'Seleccionar países...'}
                        </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
                {selectedCountries.length === 0 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded ml-1">Obligatorio</span>}
              </div>

              {/* Step 3: Cards */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</div>
                    <h3 className="font-bold text-slate-900">Tarjetas a usar</h3>
                </div>
                <button 
                    onClick={() => setStep('cards')}
                    className={`w-full p-5 rounded-3xl border-2 border-dashed flex items-center justify-between transition-all ${selectedCards.length > 0 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}
                >
                    <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                        <span className={`text-sm ${selectedCards.length > 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                            {selectedCards.length > 0 
                                ? `${selectedCards.length} tarjeta${selectedCards.length > 1 ? 's' : ''} seleccionada${selectedCards.length > 1 ? 's' : ''}`
                                : 'Seleccionar tarjetas...'}
                        </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
                {selectedCards.length === 0 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded ml-1">Obligatorio</span>}
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nota <span className="text-slate-400 font-normal">(opcional)</span></label>
                <textarea 
                    placeholder="Ej: viaje de negocios, luna de miel..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none"
                />
              </div>

              {initialData && (
                <button 
                    onClick={() => setStep('confirm_delete')}
                    className="w-full text-red-500 font-bold text-sm py-2"
                >
                    Eliminar aviso
                </button>
              )}
            </div>
          )}

          {step === 'calendar' && (
            <CalendarSelector 
                onClose={() => setStep('form')} 
                onConfirm={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                    setStep('form');
                }}
                initialStart={startDate}
                initialEnd={endDate}
            />
          )}

          {step === 'countries' && (
            <SelectionModal 
                title="Países"
                activeTab="countries"
                onTabChange={(tab) => setStep(tab as any)}
                items={COUNTRIES.map(c => ({ id: c.id, label: c.name, icon: <span className="text-xl">{c.flag}</span> }))}
                allItems={COUNTRIES.map(c => ({ id: c.id, label: c.name }))}
                selectedIds={selectedCountries}
                onToggle={(id) => setSelectedCountries(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                onClose={() => setStep('form')}
            />
          )}

          {step === 'cards' && (
            <SelectionModal 
                title="Tarjetas"
                activeTab="cards"
                onTabChange={(tab) => setStep(tab as any)}
                items={user.accounts.map(acc => ({ 
                    id: acc.id, 
                    label: acc.name, 
                    sublabel: `**** **** **** ${acc.number.slice(-4)}`,
                    icon: <div className="w-10 h-7 bg-indigo-600 rounded flex items-center justify-center text-white"><CreditCard className="w-4 h-4" /></div> 
                }))}
                allItems={user.accounts.map(acc => ({ id: acc.id, label: acc.name }))}
                selectedIds={selectedCards}
                onToggle={(id) => setSelectedCards(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                onClose={() => setStep('form')}
            />
          )}

          {step === 'confirm_delete' && (
            <div className="flex flex-col items-center text-center py-8">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">¿Eliminar este aviso?</h3>
                <p className="text-slate-500 text-sm mb-8">Se eliminarán los destinos y tarjetas registradas para este viaje.</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                    <Button onClick={() => setStep('form')} className="bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl">Cancelar</Button>
                    <Button onClick={() => onDelete(initialData!.id)} className="bg-red-500 text-white font-bold py-4 rounded-2xl">Sí, eliminar</Button>
                </div>
            </div>
          )}
        </div>

        {step === 'form' && (
            <div className="p-6 border-t border-slate-100 bg-white">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-[10px] text-slate-400">Completa los 3 campos requeridos para continuar</span>
                </div>
                <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            (i === 1 && startDate && endDate) || 
                            (i === 2 && selectedCountries.length > 0) || 
                            (i === 3 && selectedCards.length > 0)
                            ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'
                        }`}>
                            {i}
                        </div>
                    ))}
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={!isFormValid}
                    className={`w-full py-4 rounded-2xl font-bold transition-all ${isFormValid ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-indigo-100 text-indigo-300'}`}
                >
                    Guardar aviso
                </Button>
            </div>
        )}
      </motion.div>
    </div>
  );
};

const CalendarSelector: React.FC<{ onClose: () => void, onConfirm: (start: string, end: string) => void, initialStart: string, initialEnd: string }> = ({ onClose, onConfirm, initialStart, initialEnd }) => {
    const [start, setStart] = useState(initialStart);
    const [end, setEnd] = useState(initialEnd);
    
    const minDate = new Date();
    minDate.setHours(0,0,0,0);
    minDate.setDate(minDate.getDate() + 1); // Travel must be registered at least 24h in advance

    const [viewDate, setViewDate] = useState(new Date(start || minDate));
    
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(viewDate);
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const handlePrevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const clickedDate = new Date(dateStr + 'T00:00:00');
        
        if (clickedDate < minDate) return;

        if (!start || (start && end)) {
            setStart(dateStr);
            setEnd('');
        } else {
            const startDate = new Date(start + 'T00:00:00');
            if (clickedDate < startDate) {
                setStart(dateStr);
                setEnd('');
            } else {
                setEnd(dateStr);
            }
        }
    };

    const isSelected = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return dateStr === start || dateStr === end;
    };

    const isInRange = (day: number) => {
        if (!start || !end) return false;
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const d = new Date(dateStr + 'T00:00:00');
        const s = new Date(start + 'T00:00:00');
        const e = new Date(end + 'T00:00:00');
        return d > s && d < e;
    };

    const isPast = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const d = new Date(dateStr + 'T00:00:00');
        return d < minDate;
    };

    return (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xl">
            <div className="mb-4 px-2">
                <h4 className="text-sm font-bold text-slate-900">Selecciona tus fechas</h4>
                <p className="text-[10px] text-slate-500">Toca la fecha de ida y luego la de regreso</p>
            </div>
            <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-180 text-slate-400" />
                </button>
                <h4 className="font-bold text-slate-900">{capitalizedMonth} {currentYear}</h4>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-2">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const selected = isSelected(day);
                    const inRange = isInRange(day);
                    const past = isPast(day);
                    
                    return (
                        <button 
                            key={day}
                            onClick={() => handleDateClick(day)}
                            disabled={past}
                            className={`h-10 w-full flex items-center justify-center text-sm font-medium rounded-full transition-all relative
                                ${selected ? 'bg-indigo-600 text-white z-10' : ''}
                                ${inRange ? 'bg-indigo-50 text-indigo-600 rounded-none' : ''}
                                ${past ? 'text-slate-200 cursor-not-allowed' : 'text-slate-700'}
                                ${!selected && !inRange && !past ? 'hover:bg-slate-50' : ''}
                            `}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
                <Button onClick={onClose} className="bg-white border-2 border-indigo-600 text-indigo-600 font-bold py-3 rounded-2xl">Cancelar</Button>
                <Button 
                    onClick={() => onConfirm(start, end)} 
                    disabled={!start || !end}
                    className={`font-bold py-3 rounded-2xl ${start && end ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-300'}`}
                >
                    Confirmar
                </Button>
            </div>
        </div>
    );
};

interface SelectionModalProps {
    title: string;
    activeTab: 'countries' | 'cards';
    onTabChange: (tab: string) => void;
    items: { id: string, label: string, sublabel?: string, icon: React.ReactNode }[];
    allItems: { id: string, label: string }[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    onClose: () => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ title, activeTab, onTabChange, items, allItems, selectedIds, onToggle, onClose }) => {
    const [search, setSearch] = useState('');
    const filteredItems = items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                    Seleccionar {activeTab === 'countries' ? 'países' : 'tarjetas'}
                </h3>
                <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                    <X className="w-4 h-4 text-slate-500" />
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <button 
                    onClick={() => onTabChange('countries')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'countries' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                >
                    Países
                </button>
                <button 
                    onClick={() => onTabChange('cards')}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'cards' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}
                >
                    Tarjetas
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder={`Buscar ${activeTab === 'countries' ? 'países' : 'tarjetas'}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {selectedIds.length > 0 && (
                <div className="mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Seleccionados</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedIds.map(id => {
                            const item = allItems.find(i => i.id === id);
                            return (
                                <div key={id} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold">
                                    {item?.label}
                                    <button onClick={() => onToggle(id)}><X className="w-3 h-3" /></button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {filteredItems.map(item => (
                    <div 
                        key={item.id}
                        onClick={() => onToggle(item.id)}
                        className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${selectedIds.includes(item.id) ? 'bg-indigo-50 border-2 border-indigo-600' : 'bg-white border-2 border-transparent hover:bg-slate-50'}`}
                    >
                        <div className="shrink-0">{item.icon}</div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${selectedIds.includes(item.id) ? 'text-indigo-600' : 'text-slate-900'}`}>{item.label}</p>
                            {item.sublabel && <p className="text-[10px] text-slate-400">{item.sublabel}</p>}
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
                            {selectedIds.includes(item.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-6 mt-auto">
                <Button 
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200"
                >
                    Listo ({selectedIds.length} {
                        activeTab === 'countries' 
                            ? (selectedIds.length === 1 ? 'País' : 'Países')
                            : (selectedIds.length === 1 ? 'Tarjeta' : 'Tarjetas')
                    })
                </Button>
            </div>
        </div>
    );
};
