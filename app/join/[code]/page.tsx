'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function JoinRedirect() {
    const { code } = useParams();
    const router = useRouter();

    useEffect(() => {
        if (code) {
            router.push(`/?code=${code.toString().toUpperCase()}`);
        }
    }, [code, router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-pulse text-zinc-500 font-black uppercase tracking-widest">
                Redirigiendo al desmadre...
            </div>
        </div>
    );
}
