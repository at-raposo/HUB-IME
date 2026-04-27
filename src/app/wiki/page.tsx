import { redirect } from 'next/navigation';

export default function WikiRedirect() {
    redirect('/explorar?tab=wiki');
}
