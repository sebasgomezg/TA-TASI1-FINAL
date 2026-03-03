import React, { useState, useEffect } from 'react';
import { ViewState } from '../../types';
import { Header, Button, Keypad, PinDots, InputField, ActionCard, VisualCard, LoadingOverlay } from '../ui/Shared';
import { CreditCard, Hash, Smartphone, Lock, Check, Mail, X, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScreenProps {
  changeView: (view: ViewState) => void;
  rememberedData?: { dni: string, cardNumber: string } | null;
  setLoginIdentifier?: (id: { type: 'card' | 'dni', value: string } | null) => void;
  onLogin?: (type: 'card' | 'dni', value: string, remember: boolean) => { error?: string } | void;
  onPinSubmit?: (pin: string) => { error?: string, locked?: boolean, attemptsLeft?: number } | void;
  identifier?: { type: 'card' | 'dni', value: string } | null;
  lockout?: { until: number | null, attempts: number };
  isRecovery?: boolean;
  onClearRemembered?: () => void;
}

// 1. Login Methods Selection
export const LoginMethodsScreen: React.FC<ScreenProps> = ({ changeView, rememberedData, setLoginIdentifier }) => {
  const handleMethodClick = (type: 'card' | 'dni') => {
    const value = type === 'card' ? rememberedData?.cardNumber : rememberedData?.dni;
    
    if (value) {
      if (setLoginIdentifier) {
        setLoginIdentifier({ type, value });
      }
      changeView(ViewState.PIN_ENTRY);
    } else {
      changeView(type === 'card' ? ViewState.LOGIN_CARD : ViewState.LOGIN_DNI);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 pt-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-1 font-display">Banco</h1>
          <h1 className="text-4xl font-extrabold text-indigo-500 mb-4 font-display">Confía</h1>
          <p className="text-slate-500">Tú confía</p>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Inicia sesión</h2>
          <p className="text-slate-500">Selecciona tu método de acceso</p>
        </div>

        <div className="flex flex-col gap-4">
          <ActionCard 
             title="Tarjeta de débito"
             subtitle={rememberedData?.cardNumber ? `Tarjeta •••• ${rememberedData.cardNumber.slice(-4)}` : "Ingresa con tu tarjeta"}
             icon={<CreditCard className="w-6 h-6" />}
             bgColor="bg-white border border-indigo-100"
             textColor="text-indigo-600"
             onClick={() => handleMethodClick('card')}
          />
          <ActionCard 
            title="Documento de identidad"
            subtitle={rememberedData?.dni ? `DNI •••• ${rememberedData.dni.slice(-4)}` : "Ingresa con tu DNI"}
            icon={<div className="text-[10px] font-bold border-2 border-current rounded px-1">DNI</div>}
            bgColor="bg-white border border-indigo-100"
            textColor="text-indigo-600"
            onClick={() => handleMethodClick('dni')}
          />
        </div>
      </div>
      <div className="p-6 flex flex-col gap-4 items-center">
        <button 
          onClick={() => changeView(ViewState.FORGOT_PIN_IDENTIFY)}
          className="text-indigo-600 font-semibold text-sm"
        >
          ¿Problemas para acceder?
        </button>
        <div className="flex items-center gap-2 mt-2">
            <span className="text-slate-400 text-sm">¿No tienes cuenta?</span>
            <button 
                onClick={() => changeView(ViewState.REGISTER_VALIDATE)}
                className="text-indigo-600 font-bold text-sm hover:underline"
            >
                Regístrate aquí
            </button>
        </div>
      </div>
    </div>
  );
};

// 2. Login: Card Number
export const LoginCardScreen: React.FC<ScreenProps> = ({ changeView, onLogin, isRecovery }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    setCardNumber(val);
    if (error) setError(null);
  };

  const validateCard = () => {
    if (cardNumber.length > 0 && cardNumber.length < 16) {
      setError('El número de tarjeta debe tener 16 dígitos');
    } else {
      setError(null);
    }
  };

  const handleContinue = () => {
    if (cardNumber.length !== 16) {
      setError('El número de tarjeta debe tener 16 dígitos');
      return;
    }
    if (onLogin) {
      const result = onLogin('card', cardNumber, remember);
      if (result?.error) {
        setError(result.error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <Header onBack={() => changeView(isRecovery ? ViewState.FORGOT_PIN_IDENTIFY : ViewState.LOGIN_METHODS)} />
      <div className="px-8 pt-2 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ingresar número de tarjeta</h1>
          <p className="text-slate-500">Ingresa los 16 dígitos de tu tarjeta</p>
        </div>

        <VisualCard number={cardNumber} />

        <div className="mb-6">
          <InputField 
            label="Número de tarjeta"
            placeholder="4532 1234 5678 9012"
            value={cardNumber.match(/.{1,4}/g)?.join(' ') || cardNumber}
            onChange={handleCardChange}
            onBlur={validateCard}
            error={!!error}
            icon={<CreditCard className="w-5 h-5" />}
          />
          {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
          {!error && <p className="text-slate-400 text-xs mt-2 ml-1">16 dígitos sin espacios</p>}
        </div>

        {!isRecovery && (
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setRemember(!remember)}>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${remember ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
              {remember && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="text-slate-600 font-medium text-sm">Recordar tarjeta</span>
          </div>
        )}

        <div className="mt-auto pb-8 flex flex-col gap-6">
          {!isRecovery && (
            <button 
              onClick={() => changeView(ViewState.FORGOT_PIN_IDENTIFY)}
              className="text-indigo-600 font-bold text-sm text-center"
            >
              ¿Olvidaste tu PIN?
            </button>
          )}
          <Button 
            onClick={handleContinue} 
            disabled={cardNumber.length !== 16}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

// 3. Login: DNI
export const LoginDniScreen: React.FC<ScreenProps> = ({ changeView, onLogin, isRecovery }) => {
  const [dni, setDni] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    setDni(val);
    if (error) setError(null);
  };

  const validateDni = () => {
    if (dni.length > 0 && dni.length < 8) {
      setError('El DNI debe tener 8 dígitos');
    } else {
      setError(null);
    }
  };

  const handleContinue = () => {
    if (dni.length !== 8) {
      setError('El DNI debe tener 8 dígitos');
      return;
    }
    if (onLogin) {
      const result = onLogin('dni', dni, remember);
      if (result?.error) {
        setError(result.error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <Header onBack={() => changeView(isRecovery ? ViewState.FORGOT_PIN_IDENTIFY : ViewState.LOGIN_METHODS)} />
      <div className="px-8 pt-6 flex-1 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Ingresar DNI</h1>
          <p className="text-slate-500">Ingresa tu número de documento de identidad</p>
        </div>

        <div className="mb-6">
          <InputField 
            label="DNI"
            placeholder="12345678"
            value={dni}
            onChange={handleDniChange}
            onBlur={validateDni}
            error={!!error}
            icon={<div className="text-[10px] font-bold border-2 border-current rounded px-1">DNI</div>}
          />
          {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
        </div>

        {!isRecovery && (
          <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setRemember(!remember)}>
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${remember ? 'bg-indigo-600 border-indigo-600' : 'border-slate-200'}`}>
              {remember && <Check className="w-4 h-4 text-white" />}
            </div>
            <span className="text-slate-600 font-medium text-sm">Recordar DNI</span>
          </div>
        )}

        <div className="mt-auto pb-8 flex flex-col gap-6">
          {!isRecovery && (
            <button 
              onClick={() => changeView(ViewState.FORGOT_PIN_IDENTIFY)}
              className="text-indigo-600 font-bold text-sm text-center"
            >
              ¿Olvidaste tu PIN?
            </button>
          )}
          <Button 
            onClick={handleContinue} 
            disabled={dni.length !== 8}
          >
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

// 4. PIN Entry
export const PinEntryScreen: React.FC<ScreenProps> = ({ changeView, onPinSubmit, identifier, lockout, setLoginIdentifier, rememberedData, onClearRemembered }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = (val: string) => {
    if (pin.length < 6 && !isLocked && !isLoading) {
      const newPin = pin + val;
      setPin(newPin);
      setError(null);
      
      if (newPin.length === 6) {
        setIsLoading(true);
        // Simulate login verification
        setTimeout(() => {
          setIsLoading(false);
          if (onPinSubmit) {
            const result = onPinSubmit(newPin);
            if (result?.error) {
              setError(result.error);
              setPin('');
              if (result.locked) setIsLocked(true);
            }
          }
        }, 1500);
      }
    }
  };

  const handleDelete = () => {
    if (!isLocked) setPin(prev => prev.slice(0, -1));
  };

  const formatIdentifier = () => {
    if (!identifier || !identifier.value) return '';
    if (identifier.type === 'card') {
      return `Tarjeta terminada en ${identifier.value.slice(-4)}`;
    }
    return `DNI ••••${identifier.value.slice(-4)}`;
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {isLoading && <LoadingOverlay message="Iniciando sesión..." />}
      <Header onBack={() => {
        // If we have a temporary login identifier (not from remembered data), 
        // go back to the specific login screen (Card or DNI)
        const isFromRemembered = rememberedData && (identifier?.value === rememberedData.dni || identifier?.value === rememberedData.cardNumber);
        if (identifier && !isFromRemembered) {
          changeView(identifier.type === 'card' ? ViewState.LOGIN_CARD : ViewState.LOGIN_DNI);
        } else {
          // Otherwise go back to main methods
          if (setLoginIdentifier) setLoginIdentifier(null);
          changeView(ViewState.LOGIN_METHODS);
        }
      }} />
      
      <div className="px-8 pt-4 flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Ingresa tu PIN</h1>
        <div className="flex flex-col items-center gap-1 mb-8">
          <p className="text-slate-500 text-sm">{formatIdentifier()}</p>
          <button 
            onClick={() => {
              if (onClearRemembered) onClearRemembered();
              if (setLoginIdentifier) setLoginIdentifier(null);
              changeView(ViewState.LOGIN_METHODS);
            }}
            className="text-indigo-600 font-bold text-xs hover:underline"
          >
            Iniciar sesión con otra cuenta
          </button>
        </div>

        <div className="mb-10">
          <PinDots length={6} filled={pin.length} isError={!!error} />
          <p className="text-center text-slate-400 text-xs">Tu PIN de seguridad</p>
        </div>

        {error && (
          <div className={`p-4 rounded-2xl mb-6 w-full flex gap-3 items-start ${isLocked ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isLocked ? 'bg-red-100' : 'bg-orange-100'}`}>
              <span className="text-[10px] font-bold">!</span>
            </div>
            <p className="text-xs font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <div className="mt-auto w-full pb-8">
          <Keypad 
            onPress={handlePress} 
            onDelete={handleDelete} 
            onForgot={() => changeView(ViewState.FORGOT_PIN_IDENTIFY)} 
          />
        </div>
      </div>
    </div>
  );
};
