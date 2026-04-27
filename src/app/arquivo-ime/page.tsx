import { redirect } from 'next/navigation';

export default function ArquivoHubImeRedirect() {
    redirect('/hub-ime?tab=hub-ime');
}
