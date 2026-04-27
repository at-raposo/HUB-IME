'use client';

import Link from 'next/link';
import { AppRoutes } from '@/types/navigation';
import { ColisorIcon } from '../icons/ColisorIcon';
import { IMELogo } from '../icons/IMELogo';

export function Footer() {
    return (
        <footer className="bg-brand-blue border-t border-white/10 pt-16 pb-20 md:pb-8 text-white/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-3 border border-white/10 w-fit -ml-4">
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <div className="absolute w-[60%] h-[75%] bg-brand-blue rounded-[2px] top-0 left-0 z-0 shadow-sm"></div>
                                <div className="absolute w-[60%] h-[75%] bg-brand-red rounded-[2px] bottom-0 right-0 z-0 translate-y-1 shadow-sm"></div>
                                <div className="absolute w-[60%] h-[60%] bg-brand-yellow rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 shadow-md border-2 border-white"></div>
                            </div>
                            <div className="flex flex-col -space-y-0.5">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="font-bukra font-bold text-xl text-white uppercase leading-tight">HUB</span>
                                    <span className="font-bukra font-black text-xl text-white leading-tight">HUB IME</span>
                                    <div className="flex flex-col items-center opacity-70">
                                        <span className="text-[7px] font-black px-1.5 py-0.5 rounded bg-white/15 text-white/70 ml-1">V3.2.0</span>
                                        <span className="text-[8px] font-black uppercase tracking-tighter ml-1 text-white/40">(BETA)</span>
                                    </div>
                                </div>
                                <span className="text-[8px] uppercase tracking-wider text-white/50 font-bukra font-medium">IME USP</span>
                            </div>
                            <div className="flex items-center gap-2.5 ml-1">
                                <div className="w-px h-7 bg-white/20"></div>
                                <IMELogo size={42} className="text-white opacity-90" />
                            </div>
                        </div>
                        <p className="text-sm text-white/60 mb-6 leading-relaxed">
                            Hub de Comunicação Científica do HUB IME - Um projeto para melhorar a comunicação do USP e reunir em um FLUXO interativo o arquivo de material de divulgação do HUB IME e de toda a comunidade — de dentro e fora do instituto.
                        </p>

                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider border-l-4 border-white/40 pl-3">Navegação</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px] w-5 h-5 flex items-center justify-center flex-shrink-0">groups</span> Comunidade</Link></li>
                            <li><Link href="/gcime" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"><ColisorIcon size={20} animate={false} className="w-5 h-5 flex-shrink-0" /> O Grande Colisor do IF</Link></li>
                            <li><Link href="/ferramentas" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px] w-5 h-5 flex items-center justify-center flex-shrink-0">construction</span> Ferramentas acadêmicas</Link></li>
                            <li><Link href="/perguntas" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px] w-5 h-5 flex items-center justify-center flex-shrink-0">help_outline</span> Interação (Pergunte/Lab)</Link></li>

                            <li><Link href="/admin" className="flex items-center gap-3 text-[10px] text-gray-400/50 dark:text-gray-600/50 hover:text-brand-blue-accent dark:hover:text-brand-blue-accent transition-colors mt-4"><span className="material-symbols-outlined text-[16px] w-5 h-5 flex items-center justify-center flex-shrink-0">admin_panel_settings</span> Painel de Controle</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider border-l-4 border-white/40 pl-3">Responsável pelo site</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-sm text-white/60">
                                <span className="material-symbols-outlined text-[20px] w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-blue-accent">person</span>
                                <div>
                                    <p className="font-medium text-white">Adrian Raposo</p>
                                    <button
                                        onClick={() => {
                                            const email = "andyraposo@usp.br";
                                            navigator.clipboard.writeText(email);
                                            import('react-hot-toast').then(m => m.toast.success('E-mail copiado!'));
                                            window.location.href = `mailto:${email}`;
                                        }}
                                        className="hover:text-brand-blue-accent transition-colors text-left"
                                    >
                                        andyraposo@usp.br
                                    </button>
                                </div>
                            </li>

                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider border-l-4 border-brand-red pl-3">
                            <span className="text-white">HUB IME</span>
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-white/60">
                                <span className="material-symbols-outlined text-[20px] w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-red">school</span>
                                <div>
                                    <p className="text-[10px] text-white/40 mb-0.5">Docente responsável:</p>
                                    <p className="font-medium text-white">Prof. Caetano Miranda</p>
                                    <button
                                        onClick={() => {
                                            const email = "cmiranda@ime.usp.br";
                                            navigator.clipboard.writeText(email);
                                            import('react-hot-toast').then(m => m.toast.success('E-mail copiado!'));
                                            window.location.href = `mailto:${email}`;
                                        }}
                                        className="hover:text-brand-red transition-colors text-left"
                                    >
                                        cmiranda@ime.usp.br
                                    </button>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-white/60">
                                <span className="material-symbols-outlined text-[20px] w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-red">email</span>
                                <button
                                    onClick={() => {
                                        const email = "HUB IME@usp.br";
                                        navigator.clipboard.writeText(email);
                                        import('react-hot-toast').then(m => m.toast.success('E-mail copiado!'));
                                        window.location.href = `mailto:${email}`;
                                    }}
                                    className="hover:text-brand-red transition-colors text-left"
                                >
                                    HUB IME@usp.br
                                </button>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-white/60">
                                <svg className="w-5 h-5 mt-0.5 text-brand-red flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                <a href="https://www.instagram.com/hub-ime.USP/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors">@HUB IME.USP</a>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-white/60">
                                <span className="material-symbols-outlined text-[20px] w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-brand-red">place</span>
                                <span className="leading-tight">Instituto de Matemática e Estatística, Universidade de São Paulo.<br />Rua do Matão, 1010, São Paulo - SP.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                 <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <IMELogo size={80} className="text-white opacity-80 hover:opacity-100 transition-opacity" />
                        <p className="text-xs text-white/40 font-open-sans">
                            © {new Date().getFullYear()} USP. Todos os direitos reservados.
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-white/40 border border-white/20 px-2 py-0.5 rounded font-bukra">V3.2.0</span>
                            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">(BETA)</span>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-3 h-3 rounded-sm bg-brand-blue shadow-sm shadow-brand-blue/50"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-red shadow-sm shadow-brand-red/50"></div>
                            <div className="w-3 h-3 rounded-sm bg-brand-yellow shadow-sm shadow-brand-yellow/50"></div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
