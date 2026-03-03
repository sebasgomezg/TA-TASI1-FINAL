import React, { useState, useEffect } from 'react';
import { ViewState, PaymentDetails, UserContextType, Account, MovementItem } from '../../types';
import { Header, Button } from '../ui/Shared';
import { Search, ChevronRight, Check, Zap, Droplet, Smartphone, LayoutGrid, Plus, ChevronDown, Tv, Phone, MessageCircle, Mail, Send, Copy, MoreHorizontal, X } from 'lucide-react';
import { ServiceCompany, SubService } from '../../types';

export const SERVICE_COMPANIES: ServiceCompany[] = [
  {
    id: 'entel',
    name: 'Entel',
    subtitle: 'Telefonía móvil y fija',
    iconType: 'mobile',
    color: 'bg-blue-100 text-blue-600',
    subServices: [
      { id: 'mobile', name: 'Línea móvil', description: 'Paga tu teléfono celular', iconType: 'mobile', identifierLabel: 'Número de teléfono', identifierPlaceholder: 'Ej: 987654321', identifierMaxLength: 9 },
      { id: 'fixed', name: 'Línea fija', description: 'Paga tu teléfono de casa', iconType: 'phone', identifierLabel: 'Número de teléfono', identifierPlaceholder: 'Ej: 012345678', identifierMaxLength: 9 },
      { id: 'internet', name: 'Internet y TV', description: 'Paga tu plan duo o trio', iconType: 'tv', identifierLabel: 'Código de cliente', identifierPlaceholder: 'Ej: 12345678', identifierMaxLength: 8 },
    ]
  },
  {
    id: 'luz',
    name: 'Luz del Sur',
    subtitle: 'Energía eléctrica',
    iconType: 'electricity',
    color: 'bg-yellow-100 text-yellow-600',
    subServices: [
      { id: 'electricity', name: 'Suministro eléctrico', description: 'Paga tu recibo de luz', iconType: 'electricity', identifierLabel: 'Número de suministro', identifierPlaceholder: 'Ej: 1234567', identifierMaxLength: 7 },
    ]
  },
  {
    id: 'sedapal',
    name: 'Sedapal',
    subtitle: 'Agua potable',
    iconType: 'water',
    color: 'bg-blue-100 text-blue-500',
    subServices: [
      { id: 'water', name: 'Servicio de agua', description: 'Paga tu recibo de agua', iconType: 'water', identifierLabel: 'Número de suministro', identifierPlaceholder: 'Ej: 1234567', identifierMaxLength: 7 },
    ]
  },
  {
    id: 'claro',
    name: 'Claro Perú',
    subtitle: 'Telefonía e Internet',
    iconType: 'mobile',
    color: 'bg-red-100 text-red-600',
    subServices: [
      { id: 'mobile', name: 'Línea móvil', description: 'Paga tu celular Claro', iconType: 'mobile', identifierLabel: 'Número de teléfono', identifierPlaceholder: 'Ej: 987654321', identifierMaxLength: 9 },
      { id: 'fixed', name: 'Línea fija/Internet', description: 'Paga tu servicio hogar', iconType: 'phone', identifierLabel: 'Código de cliente', identifierPlaceholder: 'Ej: 12345678', identifierMaxLength: 8 },
    ]
  },
  {
    id: 'movistar',
    name: 'Movistar',
    subtitle: 'Telefonía e Internet',
    iconType: 'mobile',
    color: 'bg-blue-100 text-blue-700',
    subServices: [
      { id: 'mobile', name: 'Línea móvil', description: 'Paga tu celular Movistar', iconType: 'mobile', identifierLabel: 'Número de teléfono', identifierPlaceholder: 'Ej: 987654321', identifierMaxLength: 9 },
      { id: 'fixed', name: 'Línea fija/Internet', description: 'Paga tu servicio hogar', iconType: 'phone', identifierLabel: 'Código de cliente', identifierPlaceholder: 'Ej: 12345678', identifierMaxLength: 8 },
    ]
  }
];

const ServiceIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'mobile': return <Smartphone className={className} />;
    case 'phone': return <Phone className={className} />;
    case 'tv': return <Tv className={className} />;
    case 'electricity': return <Zap className={className} />;
    case 'water': return <Droplet className={className} />;
    default: return <LayoutGrid className={className} />;
  }
};

interface PaymentProps {
  changeView: (view: ViewState) => void;
  setPayment: (details: PaymentDetails) => void;
  payment: PaymentDetails | null;
  user: UserContextType;
  onConfirm?: (movement: Omit<MovementItem, 'id' | 'dateLabel' | 'time'>) => void;
  selectedCompany?: ServiceCompany | null;
  setSelectedCompany?: (company: ServiceCompany | null) => void;
  selectedSubService?: SubService | null;
  setSelectedSubService?: (subService: SubService | null) => void;
  paidBillIds?: string[];
  setPaidBillIds?: (ids: string[] | ((prev: string[]) => string[])) => void;
}

// 1. Payment Menu
export const PaymentMenuScreen: React.FC<PaymentProps> = ({ changeView, setSelectedCompany }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFrequent = SERVICE_COMPANIES.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <Header title="Pagar servicios" onBack={() => changeView(ViewState.DASHBOARD)} />
      
      <div className="px-6 py-4">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm mb-8">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
                placeholder="Buscar empresa" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full outline-none text-slate-900 placeholder:text-slate-400 font-medium"
            />
        </div>

        {/* Frequent Services */}
        {filteredFrequent.length > 0 && (
          <>
            <h3 className="font-bold text-lg text-slate-900 mb-4">Empresas</h3>
            <div className="flex flex-col gap-4 mb-8">
                {filteredFrequent.map(service => (
                  <div 
                      key={service.id}
                      onClick={() => {
                        if (setSelectedCompany) setSelectedCompany(service);
                        changeView(ViewState.PAYMENT_SERVICE_SELECT);
                      }}
                      className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer active:bg-slate-50 transition-colors"
                  >
                      <div className={`w-12 h-12 ${service.color} rounded-full flex items-center justify-center shrink-0`}>
                          <ServiceIcon type={service.iconType} className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                          <h4 className="font-bold text-slate-900">{service.name}</h4>
                          <p className="text-slate-400 text-xs">{service.subtitle}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
            </div>
          </>
        )}

        {filteredFrequent.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400">No se encontraron empresas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 2. Service Selection
export const PaymentServiceSelectScreen: React.FC<PaymentProps> = ({ changeView, selectedCompany, setSelectedSubService }) => {
    if (!selectedCompany) return null;

    return (
        <div className="flex flex-col h-full bg-slate-50">
             <Header title={`Pagar ${selectedCompany.name}`} onBack={() => changeView(ViewState.PAYMENT_MENU)} />
             <div className="px-6 py-4">
                 
                 <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 mb-8">
                    <div className={`w-10 h-10 ${selectedCompany.color} rounded-full flex items-center justify-center shrink-0`}>
                        <ServiceIcon type={selectedCompany.iconType} className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-900">{selectedCompany.name}</span>
                 </div>

                 <h3 className="font-bold text-lg text-slate-900 mb-4">Selecciona el servicio</h3>
                 
                 <div className="space-y-4">
                    {selectedCompany.subServices.map(sub => (
                      <div 
                          key={sub.id}
                          onClick={() => {
                            if (setSelectedSubService) setSelectedSubService(sub);
                            changeView(ViewState.PAYMENT_BILL_SELECT);
                          }}
                          className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-all"
                      >
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                              <ServiceIcon type={sub.iconType} className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                              <h4 className="font-bold text-slate-900">{sub.name}</h4>
                              <p className="text-slate-400 text-xs">{sub.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    ))}
                 </div>

             </div>
        </div>
    );
};

// 3. Bill Selection
export const PaymentBillSelectScreen: React.FC<PaymentProps> = ({ 
  changeView, 
  setPayment, 
  user, 
  onConfirm, 
  selectedCompany, 
  selectedSubService,
  paidBillIds,
  setPaidBillIds
}) => {
    const [identifier, setIdentifier] = useState('');
    const [selectedBills, setSelectedBills] = useState<string[]>([]);
    const [sourceAccount, setSourceAccount] = useState<Account>(user.accounts[0]);
    const [showAccountSelector, setShowAccountSelector] = useState(false);

    if (!selectedCompany || !selectedSubService) return null;

    // Mock logic for debts
    const TEST_NUMBER_WITH_DEBTS = '987654321';
    const TEST_NUMBER_NO_DEBTS = '987654322';
    const isIdentifierComplete = identifier.length === selectedSubService.identifierMaxLength;
    const exists = identifier === TEST_NUMBER_WITH_DEBTS || identifier === TEST_NUMBER_NO_DEBTS;
    const hasDebts = isIdentifierComplete && identifier === TEST_NUMBER_WITH_DEBTS;

    const bills = hasDebts ? [
        { id: `${selectedCompany.id}-${selectedSubService.id}-bill1`, title: `Factura ${selectedSubService.name} - Feb`, date: 'Vence: 15 Feb 2026', number: '2026-02-001234', amount: 59.90, status: 'Pendiente' },
        { id: `${selectedCompany.id}-${selectedSubService.id}-bill2`, title: `Factura ${selectedSubService.name} - Ene`, date: 'Vence: 15 Ene 2026', number: '2026-01-001233', amount: 62.50, status: 'Atrasada' },
    ].filter(b => !paidBillIds?.includes(b.id)) : [];

    useEffect(() => {
      if (hasDebts && selectedBills.length === 0) {
        setSelectedBills([`${selectedCompany.id}-${selectedSubService.id}-bill1`]);
      }
    }, [hasDebts]);

    const toggleBill = (id: string) => {
        setSelectedBills(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const totalAmount = bills
        .filter(b => selectedBills.includes(b.id))
        .reduce((sum, b) => sum + b.amount, 0);

    const handleContinue = () => {
        const paymentDetails = {
            serviceName: `${selectedCompany.name} - ${identifier}`,
            amount: totalAmount.toFixed(2),
            operationId: 'OP-' + Math.random().toString().slice(2, 10),
            companyId: selectedCompany.id,
            subServiceId: selectedSubService.id
        };
        setPayment(paymentDetails);

        if (setPaidBillIds) {
            setPaidBillIds(prev => [...prev, ...selectedBills]);
        }
        
        if (onConfirm) {
            onConfirm({
                title: 'Pago de servicio',
                subtitle: `${selectedCompany.name} - ${identifier}`,
                amount: -totalAmount,
                type: 'payment',
                account: sourceAccount.name
            });
        }
        
        changeView(ViewState.PAYMENT_SUCCESS);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
             <Header title={`Pagar ${selectedCompany.name}`} onBack={() => changeView(ViewState.PAYMENT_SERVICE_SELECT)} />
             
             <div className="px-6 py-4 flex-1 overflow-y-auto no-scrollbar pb-40">
                <div className="mb-6">
                    <label className="text-slate-500 font-bold text-sm mb-2 block">{selectedSubService.identifierLabel}</label>
                    <div className={`bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border transition-all ${isIdentifierComplete && !exists ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
                        <input 
                            type="text"
                            maxLength={selectedSubService.identifierMaxLength}
                            value={identifier}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setIdentifier(val);
                                if (val.length !== selectedSubService.identifierMaxLength) {
                                    setSelectedBills([]);
                                }
                            }}
                            className="font-bold text-slate-900 text-lg outline-none w-full"
                            placeholder={selectedSubService.identifierPlaceholder}
                        />
                        {isIdentifierComplete && exists && (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center">
                                <Check className="w-4 h-4" />
                            </div>
                        )}
                        {isIdentifierComplete && !exists && (
                            <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                                <X className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    {identifier.length > 0 && identifier.length < selectedSubService.identifierMaxLength && (
                        <p className="text-red-500 text-[10px] mt-1 font-bold ml-2 animate-in fade-in slide-in-from-top-1">
                          Debe ingresar exactamente {selectedSubService.identifierMaxLength} dígitos
                        </p>
                    )}
                    {isIdentifierComplete && !exists && (
                        <p className="text-red-500 text-[10px] mt-1 font-bold ml-2 animate-in fade-in slide-in-from-top-1">
                          Número inexistente
                        </p>
                    )}
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-4">Deudas encontradas</h3>

                {isIdentifierComplete ? (
                    exists ? (
                        bills.length > 0 ? (
                            <div className="space-y-4 mb-4">
                                {bills.map((bill) => {
                                    const isSelected = selectedBills.includes(bill.id);
                                    return (
                                        <div 
                                            key={bill.id}
                                            onClick={() => toggleBill(bill.id)}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all bg-white relative overflow-hidden ${isSelected ? 'border-indigo-600' : 'border-transparent shadow-sm'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-slate-900 leading-tight">{bill.title}</h4>
                                                            <p className="text-slate-400 text-[10px] mt-1">{bill.date}</p>
                                                            <p className="text-slate-300 text-[10px]">N° {bill.number}</p>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-2">
                                                            <span className="font-bold text-slate-900 text-lg whitespace-nowrap">S/ {bill.amount.toFixed(2)}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                                                bill.status === 'Atrasada' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'
                                                            }`}>
                                                                {bill.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white p-8 rounded-2xl shadow-sm text-center mb-8 border border-slate-100">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8" strokeWidth={3} />
                                </div>
                                <p className="font-bold text-slate-900 mb-1">¡Estás al día!</p>
                                <p className="text-slate-400 text-sm">No se encontraron deudas pendientes.</p>
                            </div>
                        )
                    ) : (
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center mb-8 border border-slate-100">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="w-8 h-8" strokeWidth={3} />
                            </div>
                            <p className="font-bold text-slate-900 mb-1">Error de búsqueda</p>
                            <p className="text-slate-400 text-sm">El número ingresado no existe en nuestros registros.</p>
                        </div>
                    )
                ) : (
                    <div className="bg-white p-8 rounded-2xl shadow-sm text-center mb-8 border border-slate-100 opacity-60">
                        <p className="text-slate-400 text-sm">Ingresa tu {selectedSubService.identifierLabel.toLowerCase()} para ver tus deudas.</p>
                    </div>
                )}

                {bills.length > 0 && (
                    <button 
                        onClick={() => setSelectedBills(bills.map(b => b.id))}
                        className="text-indigo-600 font-bold text-sm mb-8"
                    >
                        Pagar todas (S/ {(bills.reduce((s, b) => s + b.amount, 0)).toFixed(2)})
                    </button>
                )}

                <div className="mb-20">
                    <p className="font-bold text-slate-500 text-sm mb-2">Cuenta de pago</p>
                    <div 
                        onClick={() => setShowAccountSelector(true)}
                        className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer border border-transparent hover:border-indigo-100 transition-all"
                    >
                        <div>
                            <p className="font-bold text-slate-900">{sourceAccount.name} **** {sourceAccount.number.slice(-4)}</p>
                            <p className="text-slate-400 text-xs">Disponible: S/ {sourceAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2})}</p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>
             </div>

             {/* Sticky Bottom Area */}
             <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6 rounded-t-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                 <div className="flex justify-between items-center mb-4">
                     <div>
                         <p className="text-slate-900 font-bold text-lg">Total a pagar</p>
                         <p className="text-slate-400 text-xs">Comisión</p>
                     </div>
                     <div className="text-right">
                         <p className="text-slate-900 font-bold text-2xl">S/ {totalAmount.toFixed(2)}</p>
                         <p className="text-emerald-500 font-bold text-xs">S/ 0.00</p>
                     </div>
                 </div>
                 <Button onClick={handleContinue} disabled={totalAmount === 0 || identifier.length !== selectedSubService.identifierMaxLength}>Continuar</Button>
             </div>

             {/* Account Selector Modal */}
             {showAccountSelector && (
                <div className="absolute inset-0 z-50 flex items-end">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAccountSelector(false)}></div>
                    <div className="bg-white w-full rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom duration-300">
                        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Selecciona una cuenta</h3>
                        
                        <div className="space-y-4 mb-6">
                            {user.accounts.map(acc => (
                                <div 
                                    key={acc.id}
                                    onClick={() => {
                                        setSourceAccount(acc);
                                        setShowAccountSelector(false);
                                    }}
                                    className={`p-4 rounded-xl border-2 cursor-pointer flex justify-between items-center ${
                                        sourceAccount.id === acc.id 
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
                                        {sourceAccount.id === acc.id && (
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
                    </div>
                </div>
            )}
        </div>
    );
};

// 4. Payment Success
export const PaymentSuccessScreen: React.FC<PaymentProps> = ({ changeView, payment, selectedCompany }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [selectedShare, setSelectedShare] = useState('whatsapp');

    if (!payment) return null;

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
        <div className="flex flex-col h-full bg-white px-6 pt-12 items-center text-center overflow-y-auto no-scrollbar relative">
             {/* Success Toast */}
             {showSuccessToast && (
                 <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                    <span className="font-bold text-sm">Comprobante compartido con éxito</span>
                 </div>
             )}

             <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-in zoom-in duration-300">
                <Check className="w-16 h-16" strokeWidth={3} />
             </div>

             <h1 className="text-2xl font-extrabold text-slate-900 mb-2">¡Pago exitoso!</h1>
             <p className="text-slate-500 mb-8">Tu servicio fue pagado correctamente</p>

             <div className="bg-slate-50 w-full rounded-2xl p-6 mb-6">
                 <div className="text-left mb-4">
                     <p className="text-slate-500 font-bold text-xs">Monto pagado</p>
                     <p className="text-3xl font-extrabold text-slate-900">S/ {payment.amount}</p>
                 </div>
                 
                 <div className="border-t border-slate-200 my-4"></div>
                 
                 <div className="text-left mb-4">
                     <p className="text-slate-500 font-bold text-xs">Empresa</p>
                     <div className="flex items-center gap-3 mt-1">
                         <div className={`w-8 h-8 ${selectedCompany?.color || 'bg-blue-100 text-blue-600'} rounded-full flex items-center justify-center`}>
                             <ServiceIcon type={selectedCompany?.iconType || 'mobile'} className="w-4 h-4" />
                         </div>
                         <p className="font-bold text-slate-900">{payment.serviceName}</p>
                     </div>
                 </div>

                 <div className="flex justify-between items-center text-xs">
                     <p className="text-slate-500 font-bold">N° de operación</p>
                     <p className="text-indigo-600 font-bold">{payment.operationId}</p>
                 </div>
             </div>

             <div className="w-full space-y-4 mb-8">
                 <button 
                    onClick={() => setShowShareModal(true)}
                    className="w-full border border-slate-200 rounded-2xl py-4 px-4 flex items-center justify-center gap-2 font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                 >
                     <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-xl font-light">+</div>
                     Compartir comprobante
                 </button>
                 
                 <button className="w-full border border-slate-200 rounded-2xl py-4 font-bold text-slate-500 hover:bg-slate-50 transition-colors" onClick={() => changeView(ViewState.PAYMENT_MENU)}>
                     Pagar otro servicio
                 </button>
                 
                 <Button onClick={() => changeView(ViewState.DASHBOARD)}>Ir al inicio</Button>
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
