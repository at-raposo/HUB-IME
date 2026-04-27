import { redirect } from 'next/navigation';

export default async function TrilhasDetailRedirectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/ferramentas/trilhas/${id}`);
}
