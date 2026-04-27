import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { PerfilFeedbackCard } from './PerfilFeedbackCard';

export default function LabLoading() {
    return (
        <MainLayoutWrapper rightSidebar={<PerfilFeedbackCard />}>
            <div className="animate-in fade-in duration-500 w-full w-full max-w-4xl mx-auto mt-4 sm:mt-8">
                <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 mx-auto">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 w-full">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0"></div>
                        <div className="flex-1 w-full space-y-4 pt-2">
                            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2 animate-pulse mx-auto sm:mx-0"></div>
                            <div className="flex gap-4 justify-center sm:justify-start">
                               <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 animate-pulse"></div>
                               <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 animate-pulse"></div>
                               <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-16 animate-pulse"></div>
                            </div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 animate-pulse mx-auto sm:mx-0 mt-4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-full animate-pulse"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-5/6 animate-pulse"></div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-center gap-4 border-t border-gray-200 dark:border-gray-800 mb-8 max-w-3xl mx-auto pt-8">
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                   <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                   <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                   <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                </div>
            </div>
        </MainLayoutWrapper>
    );
}
