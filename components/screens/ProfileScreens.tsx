import React, { useState } from 'react';
import { ViewState, UserContextType } from '../../types';
import { Mail, Smartphone, Home, Eye, EyeOff, Pencil, ChevronRight, ArrowLeft, X, Save, AlertCircle } from 'lucide-react';
import { Button, InputField } from '../ui/Shared';

interface ProfileProps {
  changeView: (view: ViewState) => void;
  user: UserContextType;
  onUpdateUser: (field: keyof UserContextType, value: string) => void;
}

export const EditProfileScreen: React.FC<ProfileProps> = ({ changeView, user, onUpdateUser }) => {
  const [showData, setShowData] = useState(false);
  const [editingField, setEditingField] = useState<keyof UserContextType | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const initials = user.name.slice(0, 2).toUpperCase();
  const firstName = user.name.toUpperCase();
  
  // Logic to mask the full name consistently based on the user data
  const maskedFullName = user.fullName
    .split(' ')
    .map(part => {
        if (part.length <= 2) return part;
        return part.slice(0, 2) + '*'.repeat(Math.max(3, part.length - 2)); 
    })
    .join('  ');

  // Masking helpers
  const getMaskedEmail = (email: string) => {
      if (showData) return email.toUpperCase();
      const [local, domain] = email.split('@');
      if (!local || !domain) return email;
      const maskedLocal = local.slice(0, 2) + '*'.repeat(10);
      return `${maskedLocal}@${domain}`.toUpperCase();
  };

  const getMaskedPhone = (phone: string) => {
      if (showData) return phone;
      // Assume format like "987 654 321" or "987654321"
      const clean = phone.replace(/\s/g, '');
      const last3 = clean.slice(-3);
      return `*** *** *${last3}`; // Mimic format in screenshot
  };

  const getMaskedAddress = (addr: string) => {
      if (showData) return addr.toUpperCase();
      const parts = addr.split(' ');
      if (parts.length > 2) {
          return `${parts[0]} ${parts[1]} ${'*'.repeat(20)}`.toUpperCase();
      }
      return `${addr.slice(0, 6)}*********************`.toUpperCase();
  };

  const startEditing = (field: keyof UserContextType, currentValue: string) => {
      setEditingField(field);
      // Clean value for phone editing (remove spaces if any)
      if (field === 'phone') {
          setTempValue(currentValue.replace(/\s/g, ''));
      } else {
          setTempValue(currentValue);
      }
      setError(null);
  };

  const validateInput = (field: keyof UserContextType, value: string): string | null => {
      if (field === 'email') {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return "Ingresa un correo electrónico válido.";
      }
      if (field === 'phone') {
          // Remove spaces to check digits
          const cleanPhone = value.replace(/\s/g, '');
          if (!/^\d{9}$/.test(cleanPhone)) return "El celular debe tener 9 dígitos numéricos.";
      }
      if (field === 'address') {
          if (value.trim().length < 5) return "La dirección es demasiado corta.";
      }
      return null;
  };

  const saveEdit = () => {
      if (editingField) {
          const validationError = validateInput(editingField, tempValue);
          if (validationError) {
              setError(validationError);
              return;
          }
          
          onUpdateUser(editingField, tempValue);
          setEditingField(null);
          setError(null);
      }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
        {/* Customized Header */}
        <div className="bg-indigo-600 text-white pt-12 pb-4 shadow-sm">
            <div className="flex items-center gap-4 px-6">
                <button 
                    onClick={() => changeView(ViewState.DASHBOARD)} 
                    className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                     <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Edita tus datos</h1>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* User Avatar Section */}
            <div className="flex flex-col items-center pt-8 pb-8 bg-slate-50 border-b border-slate-100">
                <div className="relative mb-3">
                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-indigo-200 shadow-lg">
                        {initials}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-slate-900 text-lg font-bold tracking-wide">{firstName}</h2>
                    <Pencil className="w-4 h-4 text-orange-500 cursor-pointer" onClick={() => startEditing('name', user.name)} />
                </div>
                
                <p className="text-xs text-slate-400 tracking-widest font-mono px-6 text-center break-words w-full">
                    {showData ? user.fullName : maskedFullName}
                </p>
            </div>

            <div className="px-6 py-6">
                <h3 className="text-indigo-900 font-bold text-lg mb-6">Tus datos personales</h3>

                <div className="space-y-6">
                    {/* Email */}
                    <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                        <div className="mt-1">
                            <Mail className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-slate-900 font-bold text-sm mb-1">Correo electrónico</p>
                            <p className="text-slate-500 text-sm truncate uppercase font-medium">
                                {getMaskedEmail(user.email)}
                            </p>
                        </div>
                        <button 
                            onClick={() => startEditing('email', user.email)}
                            className="text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors"
                        >
                            Editar
                        </button>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                        <div className="mt-1">
                            <Smartphone className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-900 font-bold text-sm mb-1">Celular</p>
                            <p className="text-slate-500 text-sm tracking-widest font-medium">
                                {getMaskedPhone(user.phone)}
                            </p>
                        </div>
                        <button 
                            onClick={() => startEditing('phone', user.phone)}
                            className="text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors"
                        >
                            Editar
                        </button>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                        <div className="mt-1">
                            <Home className="w-6 h-6 text-indigo-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-900 font-bold text-sm mb-1">Dirección de domicilio</p>
                            <p className="text-slate-500 text-sm font-medium uppercase break-words">
                                {getMaskedAddress(user.address)}
                            </p>
                        </div>
                        <button 
                            onClick={() => startEditing('address', user.address)}
                            className="text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors"
                        >
                            Editar
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={() => setShowData(!showData)}
                        className="flex items-center gap-2 text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors py-2 px-4 rounded-full hover:bg-orange-50"
                    >
                        {showData ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        {showData ? 'Ocultar datos' : 'Ver datos'}
                    </button>
                </div>

                {/* Promo Banner */}
                <div className="mt-8 bg-indigo-50/80 rounded-2xl p-4 flex items-center justify-between border border-indigo-100 mb-8">
                    <div className="flex-1 pr-4">
                        <h4 className="text-indigo-900 font-bold text-sm mb-1">¿Tienes una empresa?</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            Afíliate a Evalúate y sincroniza la información de tu negocio aquí.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-10 h-10 relative flex items-center justify-center">
                             <div className="absolute inset-0 bg-indigo-200 rounded-full opacity-50"></div>
                             {/* Mock Illustration */}
                             <div className="relative z-10 w-6 h-8 bg-indigo-600 rounded-b-lg rounded-t-sm mx-auto flex items-center justify-center">
                                 <div className="w-2 h-2 bg-white rounded-full opacity-50"></div>
                             </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                </div>
            </div>
        </div>

        {/* Edit Modal */}
        {editingField && (
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center px-6 animate-in fade-in duration-200">
                <div className="bg-white w-full rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Editar {editingField === 'email' ? 'Correo' : editingField === 'phone' ? 'Celular' : editingField === 'address' ? 'Dirección' : 'Nombre'}
                        </h3>
                        <button 
                            onClick={() => setEditingField(null)}
                            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <InputField 
                            value={tempValue}
                            onChange={(e) => {
                                let val = e.target.value;
                                
                                // Restrict Phone input to numbers and max 9 digits
                                if (editingField === 'phone') {
                                    val = val.replace(/\D/g, ''); // Remove non-digits
                                    if (val.length > 9) val = val.slice(0, 9);
                                }

                                setTempValue(val);
                                if (error) setError(null); // Clear error on typing
                            }}
                            autoFocus
                            className="mb-2"
                            error={!!error}
                            type={editingField === 'phone' ? 'tel' : (editingField === 'email' ? 'email' : 'text')}
                            maxLength={editingField === 'phone' ? 9 : undefined}
                            placeholder={
                                editingField === 'phone' ? 'Ej: 987654321' : 
                                editingField === 'email' ? 'ejemplo@correo.com' : ''
                            }
                        />
                        {error ? (
                            <div className="flex items-center gap-2 mt-2 text-red-500 animate-in slide-in-from-top-1 duration-200">
                                <AlertCircle className="w-4 h-4" />
                                <p className="text-xs font-bold">{error}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 mt-2">
                                Asegúrate de que la información sea correcta.
                            </p>
                        )}
                    </div>

                    <Button onClick={saveEdit} className="flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Guardar cambios
                    </Button>
                </div>
            </div>
        )}
    </div>
  );
};