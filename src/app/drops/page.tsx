import { redirect } from 'next/navigation';

export default function DropsRedirect() {
    redirect('/comunidade?tab=updates');
}
