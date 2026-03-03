import React, { useState } from 'react';
import { ViewState, UserContextType, SecurityQuestion } from '../../types';
import { Header, Button, Keypad, PinDots, InputField, ActionCard, VisualCard } from '../ui/Shared';
import { CreditCard, Hash, Smartphone, Lock, Check, Mail, X, ArrowRight, ShieldCheck, ChevronRight, User, Phone, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface RegisterProps {
  changeView: (view: ViewState) => void;
  onNext?: (data: any) => void;
  onFinish?: (data: any) => void;
}

const RegistrationProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = ['Validación', 'Biometría', 'Datos', 'Seguridad', 'PIN'];
  return (
    <div className="px-8 mb-6">
      <div className="flex justify-between mb-2">
        {steps.map((step, i) => (
          <span key={i} className={`text-[8px] font-bold uppercase tracking-wider ${i < currentStep ? 'text-indigo-600' : i === currentStep ? 'text-slate-900' : 'text-slate-300'}`}>
            {step}
          </span>
        ))}
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`h-full flex-1 transition-all duration-500 ${i < currentStep ? 'bg-indigo-600' : i === currentStep ? 'bg-indigo-400' : 'bg-transparent'} ${i < 4 ? 'border-r border-white/20' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

// 0. Validation (Card + DNI)
export const RegisterValidateScreen: React.FC<RegisterProps> = ({ changeView, onNext }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    dni: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    // Strict validation: Card must be 4532123456789012, DNI 12345678
    if (formData.cardNumber !== '4532123456789012' || formData.dni !== '12345678') {
      setError('Los datos ingresados no coinciden con nuestros registros. Por favor, verifica tu tarjeta y DNI.');
      return;
    }
    
    // In a real app, we would validate if the user exists in the bank's database
    if (onNext) onNext(formData);
    changeView(ViewState.REGISTER_BIOMETRICS);
  };

  const isFormValid = formData.cardNumber.length === 16 && formData.dni.length === 8;

  return (
    <div className="flex flex-col h-full bg-white">
      <Header onBack={() => changeView(ViewState.LOGIN_METHODS)} />
      <RegistrationProgressBar currentStep={0} />
      <div className="px-8 pt-2 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Valida tu identidad</h1>
          <p className="text-slate-500">Ingresa tus datos bancarios para continuar</p>
        </div>

        <div className="space-y-6 mb-10">
          <InputField 
            label="Número de tarjeta" 
            placeholder="0000 0000 0000 0000" 
            value={formData.cardNumber}
            onChange={e => {
              setError(null);
              setFormData({...formData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)});
            }}
            icon={<CreditCard className="w-5 h-5" />}
          />
          <InputField 
            label="DNI" 
            placeholder="12345678" 
            value={formData.dni}
            onChange={e => {
              setError(null);
              setFormData({...formData, dni: e.target.value.replace(/\D/g, '').slice(0, 8)});
            }}
            icon={<div className="text-[10px] font-bold border-2 border-current rounded px-1">DNI</div>}
          />
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <X className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-auto pb-10">
          <Button onClick={handleNext} disabled={!isFormValid}>Validar datos</Button>
        </div>
      </div>
    </div>
  );
};

// 1. Personal Data
export const RegisterPersonalScreen: React.FC<RegisterProps> = ({ changeView, onNext }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let error = '';
    if (name === 'fullName') {
      if (!value.trim()) error = 'El nombre es obligatorio.';
      else if (/[0-9]/.test(value)) error = 'El nombre no puede contener números.';
    } else if (name === 'phone') {
      if (value.length !== 9) error = 'El celular debe tener 9 dígitos.';
    } else if (name === 'email') {
      if (!value.includes('@')) error = 'Ingresa un correo válido.';
    } else if (name === 'address') {
      if (!value.trim()) error = 'La dirección es obligatoria.';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleNext = () => {
    if (onNext) onNext(formData);
    changeView(ViewState.REGISTER_SECURITY);
  };

  const isFormValid = 
    formData.fullName && !/[0-9]/.test(formData.fullName) &&
    formData.phone.length === 9 && 
    formData.email.includes('@') &&
    formData.address.trim() &&
    Object.values(errors).every(e => !e);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <Header onBack={() => changeView(ViewState.REGISTER_BIOMETRICS)} />
      <RegistrationProgressBar currentStep={2} />
      <div className="px-8 pt-2 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Crea tu cuenta</h1>
          <p className="text-slate-500">Ingresa tus datos personales para comenzar</p>
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <InputField 
              label="Nombre completo" 
              placeholder="Ej: Juan Pérez" 
              value={formData.fullName}
              onChange={e => {
                let val = e.target.value.replace(/[0-9]/g, '');
                if (val.length > 0) {
                  val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
                }
                setFormData({...formData, fullName: val});
                if (errors.fullName) validateField('fullName', val);
              }}
              onBlur={() => validateField('fullName', formData.fullName)}
              icon={<User className="w-5 h-5" />}
              error={!!errors.fullName}
            />
            {errors.fullName && <p className="text-red-500 text-[10px] mt-1 font-medium ml-1">{errors.fullName}</p>}
          </div>

          <div>
            <InputField 
              label="Celular" 
              placeholder="987654321" 
              value={formData.phone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                setFormData({...formData, phone: val});
                if (errors.phone) validateField('phone', val);
              }}
              onBlur={() => validateField('phone', formData.phone)}
              icon={<Phone className="w-5 h-5" />}
              error={!!errors.phone}
            />
            {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-medium ml-1">{errors.phone}</p>}
          </div>

          <div>
            <InputField 
              label="Correo electrónico" 
              placeholder="correo@ejemplo.com" 
              type="email"
              value={formData.email}
              onChange={e => {
                const val = e.target.value;
                setFormData({...formData, email: val});
                if (errors.email) validateField('email', val);
              }}
              onBlur={() => validateField('email', formData.email)}
              icon={<Mail className="w-5 h-5" />}
              error={!!errors.email}
            />
            {errors.email && <p className="text-red-500 text-[10px] mt-1 font-medium ml-1">{errors.email}</p>}
          </div>

          <div>
            <InputField 
              label="Dirección" 
              placeholder="Av. Las Flores 123" 
              value={formData.address}
              onChange={e => {
                const val = e.target.value;
                setFormData({...formData, address: val});
                if (errors.address) validateField('address', val);
              }}
              onBlur={() => validateField('address', formData.address)}
              icon={<MapPin className="w-5 h-5" />}
              error={!!errors.address}
            />
            {errors.address && <p className="text-red-500 text-[10px] mt-1 font-medium ml-1">{errors.address}</p>}
          </div>
        </div>

        <div className="mt-auto pb-10">
          <Button onClick={handleNext} disabled={!isFormValid}>Continuar</Button>
        </div>
      </div>
    </div>
  );
};

// 2. Security Questions
export const RegisterSecurityScreen: React.FC<RegisterProps> = ({ changeView, onNext }) => {
  const questions = [
    '¿Cuál es el nombre de tu primera mascota?',
    '¿En qué ciudad naciste?',
    '¿Cuál es tu color favorito?',
    '¿Cuál es el nombre de tu escuela primaria?',
    '¿Cuál es el modelo de tu primer auto?'
  ];

  const [selectedQuestions, setSelectedQuestions] = useState<SecurityQuestion[]>([
    { question: questions[0], answer: '' },
    { question: questions[1], answer: '' },
    { question: questions[2], answer: '' }
  ]);

  const handleNext = () => {
    if (onNext) onNext(selectedQuestions);
    changeView(ViewState.REGISTER_PIN);
  };

  const isFormValid = selectedQuestions.every(q => q.answer.trim().length > 0);

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <Header onBack={() => changeView(ViewState.REGISTER_PERSONAL)} />
      <RegistrationProgressBar currentStep={3} />
      <div className="px-8 pt-2 flex-1 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Seguridad</h1>
          <p className="text-slate-500">Configura tus preguntas de recuperación</p>
        </div>

        <div className="space-y-8 mb-10">
          {selectedQuestions.map((sq, i) => (
            <div key={i} className="flex flex-col gap-3">
              <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Pregunta {i + 1}</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                value={sq.question}
                onChange={e => {
                  const newQs = [...selectedQuestions];
                  newQs[i].question = e.target.value;
                  setSelectedQuestions(newQs);
                }}
              >
                {questions.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <InputField 
                placeholder="Tu respuesta" 
                value={sq.answer}
                onChange={e => {
                  const newQs = [...selectedQuestions];
                  newQs[i].answer = e.target.value;
                  setSelectedQuestions(newQs);
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-auto pb-10">
          <Button onClick={handleNext} disabled={!isFormValid}>Continuar</Button>
        </div>
      </div>
    </div>
  );
};

// 3. Create PIN
export const RegisterPinScreen: React.FC<RegisterProps> = ({ changeView, onFinish }) => {
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

  const handleFinish = () => {
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
        if (onFinish) onFinish({ pin });
      } else {
        setError('Los PIN no coinciden. Intenta de nuevo.');
        setConfirmPin('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <Header onBack={() => step === 'confirm' ? setStep('create') : changeView(ViewState.REGISTER_SECURITY)} />
      <RegistrationProgressBar currentStep={4} />
      <div className="px-8 pt-2 flex-1 flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-8">
          <Lock className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          {step === 'create' ? 'Crea tu PIN' : 'Confirma tu PIN'}
        </h1>
        <p className="text-slate-500 text-center mb-10">
          {step === 'create' ? 'Este será tu código único de acceso de 6 dígitos' : 'Ingresa nuevamente tu PIN para confirmar'}
        </p>

        <PinDots length={6} filled={step === 'create' ? pin.length : confirmPin.length} isError={!!error} />

        {error && <p className="text-red-500 text-xs font-medium mb-6 text-center px-4">{error}</p>}

        {step === 'create' && (
          <div className="mx-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-6">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Recomendaciones de seguridad</h3>
            <ul className="text-[11px] text-amber-700 space-y-1 list-disc pl-4 font-medium">
              <li>No uses números consecutivos (ej: 123456)</li>
              <li>No uses números repetidos (ej: 111111)</li>
              <li>No uses tu fecha de nacimiento o DNI</li>
              <li>Evita usar números de tu tarjeta</li>
            </ul>
          </div>
        )}

        <div className="mt-auto w-full pb-10">
          <div className="scale-90 -mt-10 mb-6">
            <Keypad onPress={handlePress} onDelete={() => step === 'create' ? setPin(p => p.slice(0, -1)) : setConfirmPin(p => p.slice(0, -1))} showForgot={false} />
          </div>
          <Button onClick={handleFinish} disabled={step === 'create' ? pin.length !== 6 : confirmPin.length !== 6}>
            {step === 'create' ? 'Continuar' : 'Finalizar registro'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// 4. Biometric Validation
export const RegisterBiometricsScreen: React.FC<RegisterProps> = ({ changeView }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      setTimeout(() => {
        changeView(ViewState.REGISTER_PERSONAL);
      }, 1500);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto no-scrollbar">
      <Header onBack={() => changeView(ViewState.REGISTER_VALIDATE)} />
      <RegistrationProgressBar currentStep={1} />
      <div className="px-8 pt-2 flex-1 flex flex-col items-center">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Biometría</h1>
          <p className="text-slate-500">Valida tu identidad con reconocimiento facial</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="relative w-64 h-64 mb-10">
            {/* Face Frame */}
            <div className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-[3rem]"></div>
            
            <div className="absolute inset-4 overflow-hidden rounded-[2.5rem] bg-slate-50 flex items-center justify-center">
              {isSuccess ? (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white"
                >
                  <Check className="w-12 h-12" strokeWidth={3} />
                </motion.div>
              ) : isScanning ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-48 h-64 border-2 border-indigo-500 rounded-full opacity-50 animate-pulse"></div>
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <User className="w-32 h-32 text-indigo-100 absolute" />
                </div>
              ) : (
                <User className="w-32 h-32 text-slate-200" />
              )}
            </div>

            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-indigo-600 rounded-tl-2xl"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-indigo-600 rounded-tr-2xl"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-indigo-600 rounded-bl-2xl"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-indigo-600 rounded-br-2xl"></div>
          </div>

          <div className="text-center px-4">
            {isSuccess ? (
              <p className="text-emerald-600 font-bold text-lg">¡Identidad validada!</p>
            ) : isScanning ? (
              <p className="text-indigo-600 font-medium animate-pulse">Escaneando rostro...</p>
            ) : (
              <p className="text-slate-400 text-sm">Coloca tu rostro dentro del recuadro y asegúrate de tener buena iluminación.</p>
            )}
          </div>
        </div>

        <div className="mt-auto w-full pb-10">
          {!isSuccess && (
            <Button 
              onClick={handleScan} 
              disabled={isScanning}
              className={isScanning ? 'opacity-50' : ''}
            >
              {isScanning ? 'Procesando...' : 'Iniciar escaneo'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
