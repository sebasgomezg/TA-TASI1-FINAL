import React, { useState, useEffect } from 'react';
import { ViewState, TransactionDetails, UserContextType, PaymentDetails, MovementItem, SecurityQuestion, Favorite } from './types';
import { StatusBar } from './components/ui/Shared';
import { 
  LoginMethodsScreen, 
  LoginCardScreen,
  LoginDniScreen,
  PinEntryScreen, 
} from './components/screens/AuthScreens';
import {
  ForgotPinIdentifyScreen,
  ForgotPinMethodScreen,
  ForgotPinVerifyScreen,
  ForgotPinNewScreen,
  ForgotPinSuccessScreen
} from './components/screens/RecoveryScreens';
import {
  RegisterValidateScreen,
  RegisterPersonalScreen,
  RegisterSecurityScreen,
  RegisterPinScreen
} from './components/screens/RegistrationScreens';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { 
  TransferMenuScreen, 
  TransferFormScreen, 
  TransferConfirmScreen, 
  TransferSuccessScreen 
} from './components/screens/TransferScreens';
import {
  PaymentMenuScreen,
  PaymentServiceSelectScreen,
  PaymentBillSelectScreen,
  PaymentSuccessScreen,
  SERVICE_COMPANIES
} from './components/screens/PaymentScreens';
import {
  MovementsListScreen,
  MovementDetailScreen
} from './components/screens/MovementScreens';
import { EditProfileScreen } from './components/screens/ProfileScreens';
import { 
  TravelMainScreen
} from './components/screens/TravelScreens';
import { TravelDetails, ServiceCompany, SubService } from './types';

import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN_METHODS);
  // Track previous view specifically for Movement Detail navigation
  const [previousView, setPreviousView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Auth & Security State
  const [rememberedData, setRememberedData] = useState<{ dni: string, cardNumber: string } | null>(null);
  const [lockout, setLockout] = useState<{ until: number | null, attempts: number }>({ until: null, attempts: 0 });
  const [loginIdentifier, setLoginIdentifier] = useState<{ type: 'card' | 'dni', value: string } | null>(null);
  
  // Recovery Flow State
  const [recoveryMethod, setRecoveryMethod] = useState<'sms' | 'email' | 'ivr' | 'questions' | null>(null);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState<{ type: 'card' | 'dni', value: string } | null>(null);

  // App Data State
  const [user, setUser] = useState<UserContextType>({
    name: 'Sebastian',
    fullName: 'SEBASTIAN ARMANDO GOMEZ GARAY',
    email: 'sgomezg@pucp.edu.pe', 
    phone: '987654321',
    address: 'AV.UNIVERSITARIA 1801 SAN MIGUEL',
    dni: '12345678',
    cardNumber: '4532123456789012',
    pin: '123456', // Default PIN for demo
    securityQuestions: [
      { question: '¿Cuál es el nombre de tu primera mascota?', answer: 'Toby' },
      { question: '¿En qué ciudad naciste?', answer: 'Lima' },
      { question: '¿Cuál es tu color favorito?', answer: 'Azul' }
    ],
    favorites: [
      { id: '1', name: 'Ana Pérez', account: '**** 1122', initials: 'AP', color: 'bg-amber-100', text: 'text-amber-600' },
      { id: '2', name: 'Carlos Diaz', account: '**** 8844', initials: 'CD', color: 'bg-blue-100', text: 'text-blue-600' },
      { id: '3', name: 'Mamá', account: '**** 9090', initials: 'MA', color: 'bg-pink-100', text: 'text-pink-600' },
      { id: '4', name: 'Juan López', account: '**** 3321', initials: 'JL', color: 'bg-emerald-100', text: 'text-emerald-600' },
    ],
    accounts: [
      {
        id: '1',
        name: 'Cuenta Sueldo',
        number: '1234564321',
        balance: 8450.20,
        availableBalance: 8450.20
      },
      {
        id: '2',
        name: 'Cuenta Corriente',
        number: '9876543210',
        balance: 12500.50,
        availableBalance: 12500.50
      }
    ]
  });

  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<ServiceCompany | null>(null);
  const [selectedSubService, setSelectedSubService] = useState<SubService | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<MovementItem | null>(null);
  const [paidBillIds, setPaidBillIds] = useState<string[]>([]);
  const [travelNotices, setTravelNotices] = useState<TravelDetails[]>([]);
  const [selectedAccount, setSelectedAccount] = useState(user.accounts[0]);
  const [movements, setMovements] = useState<MovementItem[]>([
    { id: '1', title: 'Pago en POS', subtitle: 'Supermercado', dateLabel: 'Hoy', date: new Date().toISOString().split('T')[0], time: '14:32', amount: -86.40, type: 'pos', account: 'Cuenta Sueldo' },
    { id: '2', title: 'Transferencia recibida', subtitle: 'Ana Pérez', dateLabel: 'Ayer', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '18:15', amount: 250.00, type: 'transfer_in', account: 'Cuenta Sueldo' },
    { id: '3', title: 'Pago de servicio', subtitle: 'Entel', dateLabel: 'Hace 3 días', date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], time: '10:22', amount: -59.90, type: 'payment', account: 'Cuenta Sueldo' },
    { id: '4', title: 'Transferencia enviada', subtitle: 'Juan López', dateLabel: 'Hace 3 días', date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], time: '09:15', amount: -120.00, type: 'transfer_out', account: 'Cuenta Sueldo' },
    { id: '5', title: 'Depósito en efectivo', subtitle: 'Agente BCP', dateLabel: 'Hace 1 semana', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], time: '11:00', amount: 500.00, type: 'transfer_in', account: 'Cuenta Corriente' },
    { id: '6', title: 'Netflix', subtitle: 'Suscripción', dateLabel: 'Hace 1 semana', date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], time: '08:00', amount: -45.00, type: 'payment', account: 'Cuenta Corriente' },
  ]);

  const addMovement = (newMovement: Omit<MovementItem, 'id' | 'dateLabel' | 'time' | 'date'>) => {
    const movement: MovementItem = {
      ...newMovement,
      id: Math.random().toString(36).substr(2, 9),
      dateLabel: 'Hoy',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMovements(prev => [movement, ...prev]);

    // Update account balance
    setUser(prev => {
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.name === movement.account) {
          const newBalance = acc.balance + movement.amount;
          const updatedAcc = { ...acc, balance: newBalance, availableBalance: newBalance };
          // If this is the currently selected account, update it too
          if (selectedAccount.id === acc.id) {
            setSelectedAccount(updatedAcc);
          }
          return updatedAcc;
        }
        return acc;
      });
      return { ...prev, accounts: updatedAccounts };
    });
  };

  // Handler to update user profile data
  const handleUpdateUser = (field: keyof UserContextType, value: any) => {
    setUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFavorite = (favorite: Omit<Favorite, 'id'>) => {
    const newFavorite: Favorite = {
      ...favorite,
      id: Math.random().toString(36).substr(2, 9),
    };
    setUser(prev => ({
      ...prev,
      favorites: [...prev.favorites, newFavorite]
    }));
  };

  // Persistence Effect
  useEffect(() => {
    const saved = localStorage.getItem('banco_confia_remembered');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Basic validation for the new structure
        if (data && typeof data.dni === 'string' && typeof data.cardNumber === 'string') {
          setRememberedData(data);
        } else {
          // If old format or invalid, clear it to avoid crashes
          localStorage.removeItem('banco_confia_remembered');
        }
      } catch (e) {
        localStorage.removeItem('banco_confia_remembered');
      }
    }
  }, []);

  // Lockout Timer Effect
  useEffect(() => {
    if (lockout.until) {
      const interval = setInterval(() => {
        if (Date.now() >= lockout.until!) {
          setLockout(prev => ({ ...prev, until: null }));
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockout.until]);

  const clearRememberedData = () => {
    localStorage.removeItem('banco_confia_remembered');
    setRememberedData(null);
  };

  const handleLogin = (type: 'card' | 'dni', value: string, remember: boolean, isRecovery: boolean = false) => {
    // In a real app, we'd validate the identifier exists
    const isValid = type === 'card' ? value === user.cardNumber : value === user.dni;
    
    if (isValid) {
      if (isRecovery) {
        setRecoveryIdentifier({ type, value });
        setCurrentView(ViewState.FORGOT_PIN_METHOD);
        return;
      }

      if (remember) {
        const data = { dni: user.dni, cardNumber: user.cardNumber };
        localStorage.setItem('banco_confia_remembered', JSON.stringify(data));
        setRememberedData(data);
      }
      setLoginIdentifier({ type, value });
      setCurrentView(ViewState.PIN_ENTRY);
    } else {
      return { error: type === 'card' ? 'Esa tarjeta no está asociada a tu cuenta' : 'Ese DNI no está asociado a una cuenta' };
    }
  };

  const handlePinEntry = (pin: string) => {
    if (lockout.until) return { error: `Acceso bloqueado. Intenta de nuevo en ${Math.ceil((lockout.until - Date.now()) / 1000 / 60)} minutos.` };

    if (pin === user.pin) {
      setLockout({ until: null, attempts: 0 });
      setCurrentView(ViewState.DASHBOARD);
    } else {
      const newAttempts = lockout.attempts + 1;
      if (newAttempts >= 3) {
        const waitTime = 5 * 60 * 1000 * Math.pow(2, Math.floor((newAttempts - 3) / 1)); // 5m, 10m, 20m...
        setLockout({ until: Date.now() + waitTime, attempts: newAttempts });
        return { error: `Acceso bloqueado por seguridad. Intenta de nuevo en 5 minutos.`, locked: true };
      } else {
        setLockout(prev => ({ ...prev, attempts: newAttempts }));
        return { error: `PIN incorrecto. Te quedan ${3 - newAttempts} intentos antes de bloquear tu acceso.`, attemptsLeft: 3 - newAttempts };
      }
    }
  };

  const handleUpdatePin = (newPin: string) => {
    setUser(prev => ({ ...prev, pin: newPin }));
    setCurrentView(ViewState.FORGOT_PIN_SUCCESS);
  };

  const handleRegister = (data: Partial<UserContextType>) => {
    setUser(prev => ({ ...prev, ...data }));
    setCurrentView(ViewState.REGISTER_SUCCESS);
  };

  // Helper for view rendering
  const renderView = () => {
    switch (currentView) {
      // Auth Flow
      case ViewState.LOGIN_METHODS:
        return <LoginMethodsScreen changeView={setCurrentView} rememberedData={rememberedData} setLoginIdentifier={setLoginIdentifier} />;
      case ViewState.LOGIN_CARD:
        return <LoginCardScreen changeView={setCurrentView} onLogin={(type, val, rem) => handleLogin(type, val, rem)} />;
      case ViewState.LOGIN_DNI:
        return <LoginDniScreen changeView={setCurrentView} onLogin={(type, val, rem) => handleLogin(type, val, rem)} />;
      case ViewState.PIN_ENTRY:
        return (
          <PinEntryScreen 
            changeView={setCurrentView} 
            onPinSubmit={handlePinEntry} 
            identifier={loginIdentifier || rememberedData} 
            lockout={lockout}
            setLoginIdentifier={setLoginIdentifier}
            rememberedData={rememberedData}
            onClearRemembered={clearRememberedData}
          />
        );
      
      // Forgot PIN Flow
      case ViewState.FORGOT_PIN_IDENTIFY:
        return <ForgotPinIdentifyScreen changeView={setCurrentView} setRecoveryIdentifier={setRecoveryIdentifier} />;
      case ViewState.FORGOT_PIN_CARD:
        return <LoginCardScreen changeView={setCurrentView} onLogin={(type, val, rem) => handleLogin(type, val, rem, true)} isRecovery />;
      case ViewState.FORGOT_PIN_DNI:
        return <LoginDniScreen changeView={setCurrentView} onLogin={(type, val, rem) => handleLogin(type, val, rem, true)} isRecovery />;
      case ViewState.FORGOT_PIN_METHOD:
        return <ForgotPinMethodScreen changeView={setCurrentView} user={user} setRecoveryMethod={setRecoveryMethod} />;
      case ViewState.FORGOT_PIN_VERIFY:
        return <ForgotPinVerifyScreen changeView={setCurrentView} method={recoveryMethod} user={user} />;
      case ViewState.FORGOT_PIN_NEW:
        return <ForgotPinNewScreen changeView={setCurrentView} onUpdatePin={handleUpdatePin} />;
      case ViewState.FORGOT_PIN_SUCCESS:
        return <ForgotPinSuccessScreen changeView={setCurrentView} />;

      // Registration Flow
      case ViewState.REGISTER_VALIDATE:
        return <RegisterValidateScreen changeView={setCurrentView} onNext={(data) => setUser(prev => ({ ...prev, ...data }))} />;
      case ViewState.REGISTER_PERSONAL:
        return <RegisterPersonalScreen changeView={setCurrentView} onNext={(data) => setUser(prev => ({ ...prev, ...data }))} />;
      case ViewState.REGISTER_SECURITY:
        return <RegisterSecurityScreen changeView={setCurrentView} onNext={(qs) => setUser(prev => ({ ...prev, securityQuestions: qs }))} />;
      case ViewState.REGISTER_PIN:
        return <RegisterPinScreen changeView={setCurrentView} onFinish={handleRegister} />;
      case ViewState.REGISTER_SUCCESS:
        return <ForgotPinSuccessScreen changeView={setCurrentView} isRegister />;
      
      // Dashboard
      case ViewState.DASHBOARD:
        return (
          <DashboardScreen 
            user={user} 
            changeView={setCurrentView} 
            setMovement={setSelectedMovement} 
            setPreviousView={setPreviousView}
            setSelectedAccount={setSelectedAccount}
            movements={movements}
          />
        );
      case ViewState.EDIT_PROFILE:
        return <EditProfileScreen user={user} changeView={setCurrentView} onUpdateUser={handleUpdateUser} />;
      
      // Transfer Flow
      case ViewState.TRANSFER_MENU:
        return <TransferMenuScreen changeView={setCurrentView} setTransaction={setTransaction} transaction={transaction} user={user} />;
      case ViewState.TRANSFER_FORM:
        return <TransferFormScreen changeView={setCurrentView} setTransaction={setTransaction} transaction={transaction} user={user} onAddFavorite={handleAddFavorite} />;
      case ViewState.TRANSFER_CONFIRM:
        return <TransferConfirmScreen changeView={setCurrentView} setTransaction={setTransaction} transaction={transaction} user={user} onConfirm={addMovement} />;
      case ViewState.TRANSFER_SUCCESS:
        return <TransferSuccessScreen changeView={setCurrentView} setTransaction={setTransaction} transaction={transaction} user={user} />;

      // Payment Flow
      case ViewState.PAYMENT_MENU:
        return (
          <PaymentMenuScreen 
            changeView={setCurrentView} 
            setPayment={setPayment} 
            payment={payment} 
            user={user} 
            setSelectedCompany={setSelectedCompany}
          />
        );
      case ViewState.PAYMENT_SERVICE_SELECT:
        return (
          <PaymentServiceSelectScreen 
            changeView={setCurrentView} 
            setPayment={setPayment} 
            payment={payment} 
            user={user} 
            selectedCompany={selectedCompany}
            setSelectedSubService={setSelectedSubService}
          />
        );
      case ViewState.PAYMENT_BILL_SELECT:
        return (
          <PaymentBillSelectScreen 
            changeView={setCurrentView} 
            setPayment={setPayment} 
            payment={payment} 
            user={user} 
            onConfirm={addMovement} 
            selectedCompany={selectedCompany}
            selectedSubService={selectedSubService}
            paidBillIds={paidBillIds}
            setPaidBillIds={setPaidBillIds}
          />
        );
      case ViewState.PAYMENT_SUCCESS:
        return (
          <PaymentSuccessScreen 
            changeView={setCurrentView} 
            setPayment={setPayment} 
            payment={payment} 
            user={user} 
            selectedCompany={selectedCompany}
          />
        );

      // Movements Flow
      case ViewState.MOVEMENTS_LIST:
        return (
          <MovementsListScreen 
            changeView={setCurrentView} 
            setMovement={setSelectedMovement} 
            movement={selectedMovement} 
            user={user} 
            setPreviousView={setPreviousView}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            movements={movements}
          />
        );
      case ViewState.MOVEMENT_DETAIL:
        return (
          <MovementDetailScreen 
            changeView={setCurrentView} 
            setMovement={setSelectedMovement} 
            movement={selectedMovement} 
            user={user}
            previousView={previousView}
          />
        );

      // Travel Flow
      case ViewState.TRAVEL_MAIN:
        return (
          <TravelMainScreen 
            changeView={setCurrentView} 
            user={user} 
            travelNotices={travelNotices} 
            setTravelNotices={setTravelNotices} 
          />
        );

      default:
        return <LoginMethodsScreen changeView={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4 font-sans text-slate-900">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md h-screen md:h-[844px] bg-white md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative border-4 border-transparent md:border-slate-900">
        
        {/* Top Status Bar Area */}
        {currentView !== ViewState.DASHBOARD && currentView !== ViewState.EDIT_PROFILE && <StatusBar />}
        {/* Special handling for Edit Profile which has a colored header area taking up status bar space visually if needed, but we keep consistent for now or hide if it clashes with the purple header */}
        {currentView === ViewState.EDIT_PROFILE && (
           <div className="absolute top-0 left-0 right-0 z-50">
               {/* Custom White Status Bar for Purple Header */}
                <div className="flex justify-between items-center px-6 py-3 text-white">
                  <span className="font-semibold text-sm">8:51</span>
                  <div className="flex items-center gap-1.5 opacity-90">
                     <div className="w-4 h-4 border border-white/50 rounded-sm flex items-end justify-center gap-[1px] p-[1px]">
                         <div className="w-[2px] h-[3px] bg-white"></div>
                         <div className="w-[2px] h-[5px] bg-white"></div>
                         <div className="w-[2px] h-[7px] bg-white"></div>
                    </div>
                  </div>
                </div>
           </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Home Indicator (iOS style) */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/20 rounded-full mb-1 z-50"></div>
      </div>
    </div>
  );
};

export default App;