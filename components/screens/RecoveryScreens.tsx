import React, { useState, useEffect } from 'react';
import { ViewState, UserContextType } from '../../types';
import { Header, Button, Keypad, PinDots, InputField, ActionCard, VisualCard } from '../ui/Shared';
import { CreditCard, Hash, Smartphone, Lock, Check, Mail, X, ArrowRight, ShieldCheck, ChevronRight, MessageCircle, Send, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RecoveryProps {
  changeView: (view: ViewState) => void;
  user?: UserContextType;
  setRecoveryIdentifier?: (id: { type: 'card' | 'dni', value: string } | null) => void;
  setRecoveryMethod?: (method: 'sms' | 'email' | 'ivr' | 'questions' | null) => void;
  method?: 'sms' | 'email' | 'ivr' | 'questions' | null;
  onUpdatePin?: (pin: string) => void;
}

// 1. Identify for Recovery
export const ForgotPinIdentifyScreen: React.FC<RecoveryProps> = ({ changeView, setRecoveryIdentifier }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <Header onBack={() => changeView(ViewState.LOGIN_METHODS)} />
      <div className="px-8 pt-6 flex-1 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Recuperar PIN</h1>
          <p className="text-slate-500">Identifica tu cuenta para comenzar la recuperación</p>
        </div>

        <div className="flex flex-col gap-4">
          <ActionCard 
             title="Tarjeta de débito"
             subtitle="Usa tu tarjeta de 16 dígitos"
             icon={<CreditCard className="w-6 h-6" />}
             bgColor="bg-white border border-indigo-100"
             textColor="text-indigo-600"
             onClick={() => changeView(ViewState.FORGOT_PIN_CARD)}
          />
          <ActionCard 
            title="Documento de identidad"
            subtitle="Usa tu número de DNI"
            icon={<div className="text-[10px] font-bold border-2 border-current rounded px-1">DNI</div>}
            bgColor="bg-white border border-indigo-100"
            textColor="text-indigo-600"
            onClick={() => changeView(ViewState.FORGOT_PIN_DNI)}
          />
        </div>

        <div className="mt-auto pb-10 bg-indigo-50 p-6 rounded-3xl flex gap-4 items-start">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-sm text-slate-900">Seguridad Confía</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                    Nunca te pediremos tu PIN actual por teléfono, SMS o correo.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

// 2. Select Method
export const ForgotPinMethodScreen: React.FC<RecoveryProps> = ({ changeView, user, setRecoveryMethod }) => {
  const handleSelect = (method: 'sms' | 'email' | 'ivr' | 'questions') => {
    if (setRecoveryMethod) setRecoveryMethod(method);
    changeView(ViewState.FORGOT_PIN_VERIFY);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Header onBack={() => changeView(ViewState.FORGOT_PIN_IDENTIFY)} />
      <div className="px-8 pt-6 flex-1 flex flex-col">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Verificación</h1>
          <p className="text-slate-500">Selecciona un método para recibir tu código</p>
        </div>

        <div className="flex flex-col gap-4">
          <ActionCard 
             title="SMS al celular"
             subtitle={`Enviado al ••• ••• ${user?.phone.slice(-3)}`}
             icon={<MessageCircle className="w-6 h-6" />}
             onClick={() => handleSelect('sms')}
          />
          <ActionCard 
            title="Correo electrónico"
            subtitle={`Enviado a ${user?.email.split('@')[0].slice(0, 2)}••••@${user?.email.split('@')[1]}`}
            icon={<Mail className="w-6 h-6" />}
            onClick={() => handleSelect('email')}
          />
          <ActionCard 
            title="Llamada telefónica"
            subtitle="Recibe un código por voz"
            icon={<Phone className="w-6 h-6" />}
            onClick={() => handleSelect('ivr')}
          />
          <ActionCard 
            title="Preguntas de seguridad"
            subtitle="Responde tus preguntas"
            icon={<Lock className="w-6 h-6" />}
            onClick={() => handleSelect('questions')}
          />
        </div>
      </div>
    </div>
  );
};

// 3. Verify (OTP / Questions)
export const ForgotPinVerifyScreen: React.FC<RecoveryProps> = ({ changeView, method, user }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate sending code
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && timer > 0) {
      const t = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer, isLoading]);

  const handleVerify = () => {
    if (otp === '123456') {
      changeView(ViewState.FORGOT_PIN_NEW);
    } else {
      setError('Código incorrecto. Revisa e intenta de nuevo.');
      setOtp('');
      setAttempts(prev => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-white justify-center items-center px-8">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          {method === 'questions' ? 'Cargando preguntas...' : 'Enviando código...'}
        </p>
      </div>
    );
  }

  if (method === 'questions') {
    return (
      <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
        <Header onBack={() => changeView(ViewState.FORGOT_PIN_METHOD)} />
        <div className="px-8 pt-6 flex-1 flex flex-col">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Preguntas</h1>
            <p className="text-slate-500">Responde correctamente para continuar</p>
          </div>

          <div className="space-y-8">
            {user?.securityQuestions.slice(0, 2).map((q, i) => (
              <div key={i}>
                <p className="text-sm font-bold text-slate-900 mb-3">{q.question}</p>
                <InputField placeholder="Tu respuesta" />
              </div>
            ))}
          </div>

          <div className="mt-auto pb-10">
            <Button onClick={() => changeView(ViewState.FORGOT_PIN_NEW)}>Continuar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <Header onBack={() => changeView(ViewState.FORGOT_PIN_METHOD)} />
      <div className="px-8 pt-6 flex-1 flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8">
          {method === 'sms' ? <MessageCircle className="w-10 h-10" /> : <Mail className="w-10 h-10" />}
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Ingresa el código</h1>
        <p className="text-slate-500 text-center mb-10">
          Enviamos un código de 6 dígitos a tu {method === 'sms' ? 'celular' : 'correo'}.
        </p>

        <div className="flex gap-2 mb-4">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${i < otp.length ? 'border-indigo-600 bg-white' : 'border-slate-100 bg-slate-50'}`}>
              {otp[i] || ''}
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 text-xs font-medium mb-6">{error}</p>}

        <div className="flex justify-between w-full text-sm font-medium mb-10 px-2">
          <span className="text-slate-400">¿No recibiste el código?</span>
          {timer > 0 ? (
            <span className="text-slate-900">Reenviar en 0:{timer < 10 ? `0${timer}` : timer}</span>
          ) : (
            <button className="text-indigo-600 font-bold" onClick={() => setTimer(60)}>Reenviar</button>
          )}
        </div>

        <div className="mt-auto w-full pb-10">
          <div className="scale-90 -mt-10 mb-6">
            <Keypad onPress={(v) => otp.length < 6 && setOtp(p => p + v)} onDelete={() => setOtp(p => p.slice(0, -1))} showForgot={false} />
          </div>
          <Button onClick={handleVerify} disabled={otp.length !== 6}>Verificar</Button>
        </div>
      </div>
    </div>
  );
};

// 4. New PIN
export const ForgotPinNewScreen: React.FC<RecoveryProps> = ({ changeView, onUpdatePin }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [error, setError] = useState<string | null>(null);

  const handlePress = (val: string) => {
    if (step === 'create') {
      if (pin.length < 6) setPin(prev => prev + val);
    } else {
      if (confirmPin.length < 6) setConfirmPin(prev => prev + val);
    }
  };

  const handleContinue = () => {
    if (step === 'create') {
      if (pin === '123456' || pin === '111111') {
        setError('No uses secuencias obvias como 123456.');
        setPin('');
      } else {
        setStep('confirm');
        setError(null);
      }
    } else {
      if (pin === confirmPin) {
        if (onUpdatePin) onUpdatePin(pin);
      } else {
        setError('Los PIN no coinciden. Intenta de nuevo.');
        setConfirmPin('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <Header onBack={() => step === 'confirm' ? setStep('create') : changeView(ViewState.FORGOT_PIN_VERIFY)} />
      <div className="px-8 pt-6 flex-1 flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8">
          <Lock className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          {step === 'create' ? 'Crea tu nuevo PIN' : 'Confirma tu PIN'}
        </h1>
        <p className="text-slate-500 text-center mb-10">
          {step === 'create' ? 'Elige 6 dígitos que puedas recordar fácilmente' : 'Ingresa nuevamente tu nuevo PIN'}
        </p>

        <PinDots length={6} filled={step === 'create' ? pin.length : confirmPin.length} isError={!!error} />

        {error && <p className="text-red-500 text-xs font-medium mb-6 text-center px-4">{error}</p>}

        <div className="mt-auto w-full pb-10">
          <div className="scale-90 -mt-10 mb-6">
            <Keypad onPress={handlePress} onDelete={() => step === 'create' ? setPin(p => p.slice(0, -1)) : setConfirmPin(p => p.slice(0, -1))} showForgot={false} />
          </div>
          <Button onClick={handleContinue} disabled={step === 'create' ? pin.length !== 6 : confirmPin.length !== 6}>
            {step === 'create' ? 'Continuar' : 'Actualizar PIN'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// 5. Success
export const ForgotPinSuccessScreen: React.FC<RecoveryProps & { isRegister?: boolean }> = ({ changeView, isRegister }) => {
  return (
    <div className="flex flex-col h-full bg-white justify-center items-center px-8">
      <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-10 animate-in zoom-in duration-500">
        <Check className="w-16 h-16" strokeWidth={3} />
      </div>

      <h1 className="text-3xl font-bold text-slate-900 mb-4 text-center">
        {isRegister ? '¡Cuenta creada!' : '¡PIN actualizado!'}
      </h1>
      <p className="text-slate-500 text-center mb-12 leading-relaxed">
        {isRegister 
          ? 'Tu cuenta ha sido configurada con éxito. Ya puedes iniciar sesión con tus datos.' 
          : 'Tu PIN de seguridad ha sido actualizado. Ahora puedes iniciar sesión con tu nueva clave.'}
      </p>

      <Button onClick={() => changeView(ViewState.LOGIN_METHODS)}>Ir al inicio</Button>
    </div>
  );
};
