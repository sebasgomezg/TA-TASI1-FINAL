import React, { useState, useEffect } from 'react';
import { ViewState, TransactionDetails, UserContextType, Account, MovementItem, Favorite } from '../../types';
import { Header, Button, InputField, ActionCard, LoadingOverlay } from '../ui/Shared';
import { User, CreditCard, ChevronRight, Check, Info, ChevronDown, Users, Loader2, AlertCircle, MessageCircle, Mail, Send, Copy, MoreHorizontal, X } from 'lucide-react';

interface TransferProps {
  changeView: (view: ViewState) => void;
  setTransaction: (details: TransactionDetails) => void;
  transaction: TransactionDetails | null;
  user: UserContextType;
  onConfirm?: (movement: Omit<MovementItem, 'id' | 'dateLabel' | 'time'>) => void;
  onAddFavorite?: (favorite: Omit<Favorite, 'id'>) => void;
}

// 1. Menu
export const TransferMenuScreen: React.FC<TransferProps> = ({ changeView, setTransaction, user }) => {
    const [showFavorites, setShowFavorites] = useState(false);

    const favorites = user.favorites;

    const handleSelectFavorite = (fav: any) => {
        setTransaction({
            recipientName: fav.name,
            recipientAccount: fav.account,
            amount: '0.00',
            concept: '',
            date: new Date().toLocaleDateString(),
            operationId: ''
        } as any);
        changeView(ViewState.TRANSFER_FORM);
    };

    return (
        <div className="flex flex-col h-full relative">
            <Header title="Transferir" onBack={() => changeView(ViewState.DASHBOARD)} />
            <div className="px-6 pt-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-8 w-2/3">¿A quién quieres transferir?</h2>

                <div className="space-y-6">
                    <div 
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" 
                        onClick={() => setShowFavorites(true)}
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900">A un favorito</h3>
                                <p className="text-slate-500 text-sm">Transfiere a tus contactos guardados de forma rápida</p>
                            </div>
                            <ChevronRight className="text-slate-400" />
                        </div>
                        <div className="flex gap-3 pl-16">
                            {favorites.slice(0,3).map(fav => (
                                <div key={fav.id} className={`w-10 h-10 rounded-full ${fav.color} flex items-center justify-center ${fav.text} font-bold text-xs`}>
                                    {fav.initials}
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">+{favorites.length - 3}</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => {
                         // Set empty transaction to signal Third Party mode in Form
                         setTransaction({
                            recipientName: '',
                            recipientAccount: '', // Empty means third party input required
                            amount: '0.00',
                            concept: '',
                            date: new Date().toLocaleDateString(),
                            operationId: ''
                        } as any);
                        changeView(ViewState.TRANSFER_FORM);
                    }}>
                        <div className="flex items-start gap-4">
                             <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <span className="font-bold text-xs border border-current rounded px-1">123</span>
                            </div>
                             <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-900">A terceros</h3>
                                <p className="text-slate-500 text-sm">Ingresa el número de cuenta para transferir</p>
                            </div>
                            <ChevronRight className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Favorites Selection Sheet */}
            {showFavorites && (
                <div className="absolute inset-0 z-50 flex items-end">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowFavorites(false)}></div>
                    <div className="bg-white w-full h-[80%] rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom duration-300 flex flex-col">
                        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
                        <h3 className="font-bold text-xl text-slate-900 mb-6">Selecciona un favorito</h3>
                        
                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                            {favorites.map(fav => (
                                <div 
                                    key={fav.id}
                                    onClick={() => handleSelectFavorite(fav)}
                                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-full ${fav.color} flex items-center justify-center ${fav.text} font-bold`}>
                                        {fav.initials}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900">{fav.name}</h4>
                                        <p className="text-slate-400 text-sm">Cuenta {fav.account}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300" />
                                </div>
                            ))}
                        </div>
                        
                        <Button variant="secondary" onClick={() => setShowFavorites(false)} className="mt-4">Cancelar</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 2. Form (Handles both Favorite and Third Party based on context/props or mocked flow)
export const TransferFormScreen: React.FC<TransferProps> = ({ changeView, transaction, setTransaction, user, onAddFavorite }) => {
    // If recipientAccount is empty or > 9 chars initially (logic from previous steps), treat as third party input mode
    const isModeThirdParty = !transaction?.recipientAccount || transaction.recipientAccount.length > 9;
    const [isFavorite] = useState(!isModeThirdParty); // Fixed state on mount
    
    // Third Party Logic
    const [thirdPartyAccount, setThirdPartyAccount] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [accountOwner, setAccountOwner] = useState<string | null>(null);

    const [amount, setAmount] = useState(''); 
    const [concept, setConcept] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Favorites logic for third party
    const [saveToFavorite, setSaveToFavorite] = useState(false);
    const [nickname, setNickname] = useState('');
    
    // Account Selection State
    const [sourceAccount, setSourceAccount] = useState<Account>(user.accounts[0]);
    const [showAccountSelector, setShowAccountSelector] = useState(false);

    // Validate Account Async Simulation
    const validateThirdPartyAccount = async () => {
        const normalizedAccount = thirdPartyAccount.replace(/[^0-9]/g, '');
        if (normalizedAccount.length < 10) return;
        
        setIsValidating(true);
        setAccountOwner(null);
        setError(null);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Use the readme provided number for valid test (normalized)
        if (normalizedAccount === '19488888888001') {
            setAccountOwner('María González');
        } else {
            setError('No se encontró la cuenta o no es válida.');
        }
        setIsValidating(false);
    };

    const handleAmountBlur = () => {
        const num = parseFloat(amount);
        if (!isNaN(num)) {
            setAmount(num.toFixed(2));
        }
    };

    const handleContinue = async () => {
        const numAmount = parseFloat(amount);
        
        if (isNaN(numAmount) || numAmount < 1.00 || numAmount > 60000.00) {
            setError('El monto debe estar entre S/ 1.00 y S/ 60,000.00');
            return;
        }

        if (numAmount > sourceAccount.balance) {
            setError('Saldo insuficiente en la cuenta seleccionada.');
            return;
        }

        if (!isFavorite && !accountOwner) {
            if (isValidating) {
                setError('Validando cuenta, por favor espera...');
                return;
            }
            
            // Try to validate if not already done (e.g. user clicked Continue without blurring)
            const normalizedAccount = thirdPartyAccount.replace(/[^0-9]/g, '');
            if (normalizedAccount === '19488888888001') {
                setAccountOwner('María González');
                // We'll need to wait a tick for state to update or just use the local value
                // For simplicity in this mock, we'll just proceed since we know it's valid
            } else {
                setError('Debes validar una cuenta destino válida.');
                return;
            }
        }

        // Handle adding to favorites if selected
        if (!isFavorite && saveToFavorite && accountOwner) {
            if (!nickname.trim()) {
                setError('Ingresa un nombre para tu favorito.');
                return;
            }

            // Check if already in favorites (comparing last 4 digits as accounts are stored masked in this mock)
            const last4 = thirdPartyAccount.slice(-4);
            const exists = user.favorites.some(fav => fav.account.slice(-4) === last4);
            
            if (exists) {
                setError('Esta cuenta ya se encuentra en tu lista de favoritos.');
                return;
            }

            if (onAddFavorite) {
                const colors = [
                    { bg: 'bg-amber-100', text: 'text-amber-600' },
                    { bg: 'bg-blue-100', text: 'text-blue-600' },
                    { bg: 'bg-pink-100', text: 'text-pink-600' },
                    { bg: 'bg-emerald-100', text: 'text-emerald-600' },
                    { bg: 'bg-indigo-100', text: 'text-indigo-600' },
                ];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                onAddFavorite({
                    name: nickname,
                    account: `**** ${thirdPartyAccount.slice(-4)}`,
                    initials: nickname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                    color: randomColor.bg,
                    text: randomColor.text
                });
            }
        }

        if (transaction) {
            setTransaction({
                ...transaction,
                amount,
                concept: concept || (isFavorite ? 'Transferencia a contacto' : 'Transferencia a tercero'),
                sourceAccount: sourceAccount,
                recipientName: isFavorite ? transaction.recipientName : (accountOwner || ''),
                recipientAccount: isFavorite ? transaction.recipientAccount : thirdPartyAccount
            });
            changeView(ViewState.TRANSFER_CONFIRM);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <Header title={!isFavorite ? "Transferir a tercero" : "Nueva transferencia"} onBack={() => changeView(ViewState.TRANSFER_MENU)} />
            
            <div className="flex-1 px-6 pt-4 overflow-y-auto no-scrollbar">
                
                {/* Third Party Input Section */}
                {!isFavorite && (
                    <div className="mb-6">
                         <label className="text-slate-500 text-sm font-bold mb-2 block">Número de cuenta destino</label>
                         <div className="relative">
                            <input 
                                value={thirdPartyAccount}
                                maxLength={20}
                                onChange={(e) => {
                                    setThirdPartyAccount(e.target.value);
                                    setAccountOwner(null);
                                    if(error) setError(null);
                                }}
                                onBlur={validateThirdPartyAccount}
                                placeholder="Ej: 194-88888888-0-01"
                                className={`w-full bg-white p-4 rounded-xl shadow-sm outline-none font-medium text-slate-900 border-2 ${
                                    accountOwner ? 'border-emerald-500' : (error && !amount.includes('monto') ? 'border-red-500' : 'border-transparent focus:border-indigo-500')
                                }`}
                            />
                            {isValidating && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                </div>
                            )}
                         </div>

                         {/* Validation Result */}
                         {accountOwner && (
                             <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                                 <div className="bg-emerald-100/50 p-4 rounded-xl flex items-center gap-4 text-emerald-800">
                                     <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                                         <Check className="w-4 h-4" />
                                     </div>
                                     <div>
                                         <p className="font-bold text-sm">Cuenta validada</p>
                                         <p className="font-bold text-sm">{accountOwner}</p>
                                     </div>
                                 </div>

                                 {/* Save to favorites option */}
                                 <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                     <div className="flex items-center justify-between mb-3">
                                         <div className="flex items-center gap-2">
                                             <Users className="w-4 h-4 text-indigo-600" />
                                             <span className="text-sm font-bold text-slate-700">¿Guardar en favoritos?</span>
                                         </div>
                                         <button 
                                            onClick={() => setSaveToFavorite(!saveToFavorite)}
                                            className={`w-10 h-6 rounded-full transition-colors relative ${saveToFavorite ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                         >
                                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${saveToFavorite ? 'left-5' : 'left-1'}`}></div>
                                         </button>
                                     </div>
                                     
                                     {saveToFavorite && (
                                         <div className="animate-in zoom-in-95 duration-200">
                                             <input 
                                                placeholder="Nombre del contacto (Nick)"
                                                value={nickname}
                                                onChange={(e) => setNickname(e.target.value)}
                                                className="w-full bg-slate-50 p-3 rounded-lg outline-none text-sm font-medium border border-slate-100 focus:border-indigo-300"
                                             />
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )}
                    </div>
                )}

                {/* Favorite Visualization */}
                {isFavorite && transaction && (
                     <div className="mb-6">
                        <label className="text-slate-500 text-sm font-bold mb-2 block">Cuenta destinatario</label>
                        <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-sm">
                                {transaction.recipientName.slice(0,2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{transaction.recipientName}</h3>
                                <p className="text-slate-400 text-xs">Cuenta {transaction.recipientAccount}</p>
                            </div>
                        </div>
                     </div>
                )}

                {/* Source Account Selector */}
                <div className="mb-6">
                    <label className="text-slate-500 text-sm font-bold mb-2 block">Cuenta origen</label>
                    <div 
                        onClick={() => setShowAccountSelector(true)}
                        className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm cursor-pointer active:bg-slate-50 transition-colors border border-transparent hover:border-indigo-100"
                    >
                        <div>
                            <p className="font-bold text-slate-900">{sourceAccount.name} **** {sourceAccount.number.slice(-4)}</p>
                            <p className="text-slate-400 text-xs">Disponible: S/ {sourceAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2})}</p>
                        </div>
                        <ChevronDown className="w-5 h-5 text-indigo-600" />
                    </div>
                </div>

                {/* Amount */}
                <div className="mb-6">
                     <label className="text-slate-500 text-sm font-bold mb-2 block">Monto a transferir</label>
                     <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-2 focus-within:ring-2 ring-indigo-100 transition-all">
                         <span className="text-slate-400 font-bold text-xl">S/</span>
                         <input 
                            type="text"
                            inputMode="decimal"
                            value={amount} 
                            placeholder="0.00"
                            onBlur={handleAmountBlur}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                                // Only allow numbers and one decimal point
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                const parts = val.split('.');
                                if (parts.length <= 2) {
                                    setAmount(val);
                                }
                                if(error) setError(null);
                            }}
                            className="w-full text-3xl font-bold text-slate-900 outline-none placeholder:text-slate-200"
                         />
                     </div>
                     <p className="text-slate-400 text-[10px] mt-1 ml-1 font-medium">Límite: S/ 1.00 - S/ 60,000.00</p>
                </div>

                {/* Concept */}
                <div className="mb-8">
                     <label className="text-slate-500 text-sm font-bold mb-2 block">Concepto (opcional)</label>
                     <input 
                        placeholder={!isFavorite ? "Ej: Pago de alquiler" : "Ej: Pago por cena"}
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        className="w-full bg-white p-4 rounded-xl outline-none shadow-sm placeholder:text-slate-300 border border-transparent focus:border-indigo-100"
                     />
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Summary */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <p className="text-slate-500 font-bold text-sm mb-1">Resumen</p>
                        <p className="text-slate-900 font-bold">Transferirás</p>
                        <p className="text-slate-400 text-sm">Comisión</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-900 font-bold text-xl">S/ {parseFloat(amount || '0').toFixed(2)}</p>
                        <p className="text-emerald-500 font-bold text-sm">S/ 0.00</p>
                    </div>
                </div>

                <Button onClick={handleContinue} className="mb-8">Continuar</Button>
            </div>

            {/* Account Selector Modal/Sheet */}
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

// 3. Confirm
export const TransferConfirmScreen: React.FC<TransferProps> = ({ changeView, transaction, user, onConfirm }) => {
    const [isLoading, setIsLoading] = useState(false);
    if (!transaction) return null;

    const initials = transaction.recipientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const isThirdParty = transaction.recipientAccount.length > 9;
    
    // Fallback if sourceAccount wasn't passed properly (though logic ensures it is)
    const sourceAccount = transaction.sourceAccount || user.accounts[0];

    const handleConfirm = () => {
        setIsLoading(true);
        
        // Simulate transaction processing
        setTimeout(() => {
            setIsLoading(false);
            if (onConfirm) {
                onConfirm({
                    title: 'Transferencia enviada',
                    subtitle: transaction.recipientName,
                    amount: -parseFloat(transaction.amount),
                    type: 'transfer_out',
                    account: sourceAccount.name
                });
            }
            changeView(ViewState.TRANSFER_SUCCESS);
        }, 3000);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
             {isLoading && <LoadingOverlay message="Procesando transferencia..." />}
             <Header title="Confirmar transferencia" onBack={() => changeView(ViewState.TRANSFER_FORM)} />
             
             <div className="px-6 pt-4 flex-1 overflow-y-auto no-scrollbar">
                <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 text-center">
                    <p className="text-slate-500 font-bold text-sm mb-2">Vas a transferir</p>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-8">S/ {transaction.amount}</h1>

                    <div className="text-left mb-6">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-1">DESDE</p>
                        <p className="font-bold text-slate-900">{sourceAccount.name}</p>
                        <p className="text-slate-400 text-sm">**** {sourceAccount.number.slice(-4)}</p>
                    </div>

                    <div className="border-t border-slate-100 my-6"></div>

                    <div className="text-left mb-6 flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${isThirdParty ? 'bg-amber-100 text-amber-600' : 'bg-amber-100 text-amber-600'}`}>
                             {isThirdParty ? 'MG' : initials}
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase mb-1">PARA</p>
                            <p className="font-bold text-slate-900">{transaction.recipientName}</p>
                            <p className="text-slate-400 text-sm break-all">Cuenta {transaction.recipientAccount}</p>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 my-4"></div>

                    <div className="text-left mb-4">
                         <p className="text-slate-500 font-bold text-sm">Concepto</p>
                         <p className="text-slate-900">{transaction.concept}</p>
                    </div>

                    <div className="text-left flex justify-between items-center">
                         <p className="text-slate-500 font-bold text-sm">Comisión</p>
                         <p className="text-emerald-500 font-bold">S/ 0.00</p>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl flex items-center gap-3 mb-8">
                     <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0 text-xs font-bold">i</div>
                     <p className="text-blue-600 text-sm font-medium">Verifica los datos antes de confirmar</p>
                </div>

                <div className="space-y-4 mb-8">
                    <Button onClick={handleConfirm}>Confirmar transferencia</Button>
                    <Button variant="ghost" className="bg-white border border-slate-200" onClick={() => changeView(ViewState.DASHBOARD)}>Cancelar</Button>
                </div>
             </div>
        </div>
    );
};

// 4. Success
export const TransferSuccessScreen: React.FC<TransferProps> = ({ changeView, transaction }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [selectedShare, setSelectedShare] = useState('whatsapp');

    if (!transaction) return null;

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

             <h1 className="text-2xl font-extrabold text-slate-900 mb-2">¡Transferencia exitosa!</h1>
             <p className="text-slate-500 mb-8">Tu dinero fue enviado correctamente</p>

             <div className="bg-slate-50 w-full rounded-2xl p-6 mb-6">
                 <div className="text-left mb-4">
                     <p className="text-slate-500 font-bold text-xs">Monto transferido</p>
                     <p className="text-3xl font-extrabold text-slate-900">S/ {transaction.amount}</p>
                 </div>
                 
                 <div className="border-t border-slate-200 my-4"></div>
                 
                 <div className="text-left mb-4">
                     <p className="text-slate-500 font-bold text-xs">Destinatario</p>
                     <p className="font-bold text-slate-900">{transaction.recipientName}</p>
                 </div>

                 <div className="flex justify-between items-center text-xs">
                     <p className="text-slate-500 font-bold">N° de operación</p>
                     <p className="text-indigo-600 font-bold">OP-20260205-8847</p>
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
                 
                 <button className="w-full border border-slate-200 rounded-2xl py-4 font-bold text-slate-500 hover:bg-slate-50 transition-colors" onClick={() => changeView(ViewState.TRANSFER_MENU)}>
                     Hacer otra transferencia
                 </button>
                 
                 <Button onClick={() => changeView(ViewState.DASHBOARD)}>Ir al inicio</Button>
             </div>
             
             <div className="mt-auto pb-4 text-xs text-slate-400">
                 Banco Confía • Tú confía
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