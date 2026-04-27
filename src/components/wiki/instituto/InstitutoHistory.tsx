import React from 'react';

export function InstitutoHistory() {
    return (
        <section className="py-20 border-t border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-[2px] w-8 bg-brand-red"></div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white italic uppercase tracking-tighter">História e Legado</h2>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
                <div className="space-y-6 text-gray-700 dark:text-gray-300">
                    <p className="text-lg leading-relaxed">
                        A história do Instituto de Física da Universidade de São Paulo (IFUSP) é indissociável da própria história da ciência no Brasil. Criado oficialmente em 1934, o Departamento de Física da Faculdade de Filosofia, Ciências e Letras (FFCL) nasceu com a missão de estabelecer as bases da pesquisa científica fundamental no país.
                    </p>
                    
                    <div className="pl-6 border-l-2 border-brand-blue/30 py-4 italic text-gray-500 dark:text-gray-400">
                        "O IFUSP não apenas ensina física; ele molda os cientistas que definirão o futuro tecnológico e acadêmico da nossa nação."
                    </div>

                    <p className="leading-relaxed">
                        Sob a liderança de pioneiros como Wataghin e Occhialini, o departamento rapidamente se tornou um polo de atração para mentes brilhantes, consolidando-se como o maior centro de excelência em física da América Latina. Em 1970, com a reforma universitária, o departamento foi transformado em instituto, ganhando a autonomia necessária para expandir suas fronteiras de pesquisa.
                    </p>

                    <p className="leading-relaxed">
                        Hoje, o IFUSP é uma potência acadêmica com infraestrutura de nível global. Seus laboratórios e pesquisadores participam ativamente de grandes colaborações internacionais, como o CERN, contribuindo para descobertas que vão desde o Boson de Higgs até avanços fundamentais em física da matéria condensada e astrofísica.
                    </p>

                    <div className="flex items-start gap-3 p-5 rounded-2xl bg-brand-red/5 border border-brand-red/10 mt-4">
                        <span className="material-symbols-outlined text-brand-red text-xl shrink-0 mt-0.5">archive</span>
                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                            <strong className="text-gray-200">Esta seção foi produzida em parceria com o Acervo Histórico do Instituto de Física da USP.</strong> Para informações mais detalhadas, fotografias de época, documentos originais e depoimentos, visite o <a href="https://portal.if.usp.br/ifusp/acervo" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline font-bold">Acervo Histórico do IF</a>.
                        </p>
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white italic">1934</span>
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Fundação do Depto</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white italic">1970</span>
                        <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Criação do Instituto</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-4xl font-black text-gray-900 dark:text-white italic">450+</span>
                        <span className="text-[10px] font-black text-brand-yellow uppercase tracking-widest">Publicações Anuais</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
