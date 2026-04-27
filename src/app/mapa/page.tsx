import { redirect } from 'next/navigation';

export default function MapaRedirect() {
    redirect('/explorar?tab=mapa');
}
