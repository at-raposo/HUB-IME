import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://if-usp-ciencia.vercel.app';

    // Fetch all approved submissions
    const { data: submissions } = await supabase
        .from('submissions')
        .select('id, updated_at')
        .eq('status', 'aprovado');

    const submissionUrls = (submissions || []).map((sub) => ({
        url: `${baseUrl}/arquivo/${sub.id}`,
        lastModified: new Date(sub.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/fluxo`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/arquivo-labdiv`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...submissionUrls,
    ];
}
