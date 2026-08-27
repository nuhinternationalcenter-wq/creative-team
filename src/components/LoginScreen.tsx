import React from 'react';
import { signInWithGoogle } from '../lib/auth';
import { Sparkles } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center">
        <div className="w-20 h-20 bg-black rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-black/20">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Creative</h1>
        <p className="text-slate-500 mb-8">Sign in to collaborate with your team and manage your workflow seamlessly.</p>
        
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-200 hover:border-black text-slate-700 hover:text-black font-bold py-3 px-6 rounded-xl transition shadow-sm hover:shadow-md"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};
