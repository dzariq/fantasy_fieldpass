// app/competitions/[competitionId]/leagues/LeaguesWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { League } from '@/types';
import LeaguesClient from './LeaguesClient';

interface LeaguesWrapperProps {
    competitionId: string;
}

export default function LeaguesWrapper({ competitionId }: LeaguesWrapperProps) {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [phone, setPhone] = useState('');

    useEffect(() => {
        async function fetchLeagues() {
            const authData = localStorage.getItem('fantasy_auth');
            if (!authData) {
                setIsLoading(false);
                return;
            }

            const { phone } = JSON.parse(authData);
            
            setPhone(phone)
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/leagues?competition_id=${competitionId}&owner_id=${phone}`
                );

                if (response.ok) {
                    const data = await response.json();

                    setLeagues(data.leagues || []);
                }
            } catch (error) {
                console.error('Error fetching leagues:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLeagues();
    }, [competitionId]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading leagues...</p>
                
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background: linear-gradient(180deg, #0a0e27 0%, #151a32 100%);
                    }

                    .spinner {
                        width: 48px;
                        height: 48px;
                        border: 4px solid rgba(0, 255, 135, 0.1);
                        border-top-color: var(--primary);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    p {
                        margin-top: 1rem;
                        color: var(--text-muted);
                        font-weight: 600;
                    }
                `}</style>
            </div>
        );
    }

    return <LeaguesClient leagues={leagues} competitionId={competitionId} team_id={phone} />;
}