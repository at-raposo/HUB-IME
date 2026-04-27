import { redirect } from 'next/navigation';

export default function ColisorRedirect() {
    redirect('/explorar?tab=colisor');
}
