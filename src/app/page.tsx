import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { SidebarRight } from '@/components/layout/SidebarRight';
import { FluxoFeedbackCard } from '@/app/FluxoFeedbackCard';
import { 
    fetchSubmissions, 
    fetchTrendingSubmissions, 
    getFeaturedSubmissions 
} from '@/app/actions/submissions';
import { ComunidadeClient } from '@/components/comunidade/ComunidadeClient';

export default async function Home() {
    // Fetch initial data for the Comunidade Hub
    const [submissions, trending, featured] = await Promise.all([
        fetchSubmissions({ page: 1, limit: 12, query: '', sort: 'recentes' }),
        fetchTrendingSubmissions(),
        getFeaturedSubmissions(3)
    ]);

    const initialFluxoData = {
        items: submissions.items,
        hasMore: submissions.hasMore,
        trendingItems: trending,
        featuredItems: featured,
    };

    return (
        <MainLayoutWrapper
            userId={undefined}
            rightSidebar={<><FluxoFeedbackCard /><SidebarRight /></>}
            fullWidth={true}
        >
            <ComunidadeClient initialFluxoData={initialFluxoData} />
        </MainLayoutWrapper>
    );
}
