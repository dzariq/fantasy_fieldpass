'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Player, Team, Rules, UserTeam, DUMMY_PLAYERS } from '@/types';
import PlayerCard from '@/components/PlayerCard';
import Pitch from '@/components/Pitch';
import PlayerProfileModal from '@/components/PlayerProfileModal';
import WhatsAppAuth from '@/components/WhatsappAuth';
import Header from '@/components/Header';
import SidePanel from '@/components/SidePanel';
import FloatingControls from '@/components/FloatingControls';
import PlayerPanel from '@/components/PlayerPanel';
import ProfileModal from '@/components/ProfileModal';
import SwapModeBanner from '@/components/SwapModeBanner';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { useCaptainManagement } from '@/hooks/useCaptainManagement';
import { useChipManagement } from '@/hooks/useChipManagement';
import { useSwapManagement } from '@/hooks/useSwapManagement';
import { useTeamActions } from '@/hooks/useTeamActions';
import { apiService } from '@/services/apiService';
import { 
    getTeamName, 
    calculateTotalPoints, 
    calculateCurrentPoint, 
    getChipStats,
    createEmptyTeamTemplate,
    filterAndSortPlayers
} from '@/utils/teamUtils';
import './page.styles.css';

export default function Home() {
    const router = useRouter();
    const [competitionId] = useState(process.env.NEXT_PUBLIC_FANTASY_COMPETITION_ID);
    
    // State
    const [mounted, setMounted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authPhone, setAuthPhone] = useState('');
    const [authCountryCode, setAuthCountryCode] = useState('');
    const [players, setPlayers] = useState<Player[]>(DUMMY_PLAYERS);
    const [teams, setTeams] = useState<Team[]>([]);
    const [rules, setRules] = useState<Rules | null>(null);
    const [userTeam, setUserTeam] = useState<UserTeam | null>(null);
    const [currentMatchweek, setCurrentMatchweek] = useState(1);
    const [pitch, setPitch] = useState('');
    const [isLineupLocked, setIsLineupLocked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<Player | null>(null);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    
    // Player selection state
    const [sortBy, setSortBy] = useState<string>('name');
    const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
    const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPlayerList, setShowPlayerList] = useState(false);

    // Custom hooks
    const {
        getCurrentMatchweekData,
        getSelectedPlayers,
        getRemainingBudget,
        getTransfersRemaining,
        isPlayerSelected,
        canAddPlayer,
        addPlayer,
        removePlayer,
        handleFormationChange: handleFormation
    } = useTeamManagement(
        userTeam, 
        setUserTeam, 
        currentMatchweek, 
        rules, 
        authPhone, 
        authCountryCode
    );

    const captainManagement = useCaptainManagement(
        userTeam,
        setUserTeam,
        currentMatchweek,
        rules,
        isLineupLocked
    );

    const chipManagement = useChipManagement(
        userTeam,
        setUserTeam,
        currentMatchweek,
        rules,
        isLineupLocked,
        getCurrentMatchweekData
    );

    const {
        swapMode,
        swapSourcePlayer,
        handleSwapPlayer,
        cancelSwap
    } = useSwapManagement(
        userTeam,
        setUserTeam,
        currentMatchweek,
        rules,
        isLineupLocked
    );

    const teamActions = useTeamActions(
        userTeam,
        setUserTeam,
        currentMatchweek,
        rules,
        teams,
        competitionId,
        authPhone,
        authCountryCode,
        getCurrentMatchweekData,
        getSelectedPlayers,
        getRemainingBudget,
        setIsLoading
    );

    // Load data function
    const loadData = async () => {
        try {
            setIsLoading(true);
            
            const rulesRes = await apiService.fetchRules(competitionId!);
            setRules(rulesRes);
            setCurrentMatchweek(rulesRes.matchweek);
            setPitch(`${process.env.NEXT_PUBLIC_FANTASY_DASHBOARD_URL}/${rulesRes.pitch_image}`);

            const phoneNumber = authPhone || '186663282';
            
            let teamData: UserTeam;
            try {
                const savedTeam = await apiService.fetchSavedTeam(competitionId, phoneNumber);
                teamData = savedTeam;
            } catch {
                teamData = createEmptyTeamTemplate(rulesRes.matchweek, rulesRes);
            }

            setUserTeam(teamData);

            const isProfileIncomplete = !teamData.name || 
                                       !teamData.manager || 
                                       !teamData.country_code || 
                                       !teamData.phone;

            if (isProfileIncomplete) {
                setShowProfileModal(true);
            }

            const [playersRes, teamsRes] = await Promise.all([
                apiService.fetchPlayers(competitionId!),
                apiService.fetchTeams(competitionId!)
            ]);

            if (playersRes[0]?.name) {
                setPlayers(playersRes);
            }
            setTeams(teamsRes);
        } catch (error) {
            console.error('❌ Error loading data:', error);
            alert('Failed to load game data. Please refresh the page.');
        } finally {
            setIsLoading(false);
        }
    };

    const checkDeadline = () => {
        if (!rules) return;

        if (currentMatchweek === rules.matchweek) {
            const deadlineMs = parseInt(rules.deadline) * 1000;
            const now = Date.now();
            setIsLineupLocked(now >= deadlineMs);
        } else {
            setIsLineupLocked(false);
        }
    };

    const handleViewProfile = (player: Player) => {
        setSelectedPlayerProfile(player);
    };

    const closeProfileModal = () => {
        setSelectedPlayerProfile(null);
    };

    const handleProfileModalClose = () => {
        if (!userTeam) return;

        userTeam.phone = authPhone;

        if (!userTeam.name || !userTeam.manager || !userTeam.country_code || (!userTeam.phone)) {
            alert('⚠️ Please complete all profile fields before continuing!');
            return;
        }

        setShowProfileModal(false);
    };

    const handleAuthenticated = (phone: string, countryCode: string) => {
        setIsAuthenticated(true);
        setAuthPhone(phone);
        setAuthCountryCode(countryCode);
    };

    const handleLogout = () => {
        localStorage.removeItem('fantasy_auth');
        setIsAuthenticated(false);
        setAuthPhone('');
        setAuthCountryCode('');
        setUserTeam(null);
    };

    const handlePlayerSelect = (player: Player) => {
        if (currentMatchweek < (rules?.matchweek || 1)) {
            alert('📜 This is a past matchweek - View only! Cannot make changes.');
            return;
        }

        if (currentMatchweek > (rules?.matchweek || 1)) {
            alert('🔮 Cannot view future matchweeks!');
            return;
        }

        if (isLineupLocked && currentMatchweek === rules?.matchweek) {
            alert('⏰ Deadline has passed! Lineup is locked for Matchweek ' + rules?.matchweek);
            return;
        }

        if (!userTeam) return;

        const selected = isPlayerSelected(player);

        if (selected) {
            removePlayer(player);
        } else {
            if (canAddPlayer(player)) {
                addPlayer(player);
            }
        }
    };

    // Effects
    useEffect(() => {
        const authData = localStorage.getItem('fantasy_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                const hoursSinceAuth = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
                if (hoursSinceAuth < 24 && parsed.authenticated) {
                    setIsAuthenticated(true);
                    setAuthPhone(parsed.phone);
                    setAuthCountryCode(parsed.countryCode);
                } else {
                    localStorage.removeItem('fantasy_auth');
                }
                setMounted(true);
            } catch (error) {
                localStorage.removeItem('fantasy_auth');
                setMounted(true);
            }
        } else {
            setMounted(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        checkDeadline();
    }, [currentMatchweek, rules]);

    if (!isAuthenticated) {
        return mounted && (<WhatsAppAuth onAuthenticated={handleAuthenticated} />);
    }

    const filteredPlayers = filterAndSortPlayers(
        players,
        selectedPosition,
        selectedTeam,
        searchQuery,
        sortBy
    );

    const currentData = getCurrentMatchweekData();
    const selectedPlayers = getSelectedPlayers();
    const chipStats = getChipStats(userTeam, rules);

    return mounted && (
        <div className="app">
            {showProfileModal && userTeam && (
                <ProfileModal
                    userTeam={userTeam}
                    authCountryCode={authCountryCode}
                    authPhone={authPhone}
                    onProfileChange={teamActions.handleProfileChange}
                    onClose={handleProfileModalClose}
                />
            )}

            {selectedPlayerProfile && (
                <PlayerProfileModal
                    player={selectedPlayerProfile}
                    teamName={getTeamName(teams, selectedPlayerProfile.team_id)}
                    onClose={closeProfileModal}
                />
            )}

            <Header
                showPlayerList={showPlayerList}
                isSidePanelOpen={isSidePanelOpen}
                setIsSidePanelOpen={setIsSidePanelOpen}
                currentMatchweek={currentMatchweek}
                setCurrentMatchweek={setCurrentMatchweek}
                rules={rules}
                calculateCurrentPoint={() => calculateCurrentPoint(userTeam, currentMatchweek)}
                currentData={currentData}
                handleFormationChange={(formation) => handleFormation(formation, isLineupLocked)}
                isLineupLocked={isLineupLocked}
                saveTeam={teamActions.saveTeam}
                resetToSavedTeam={teamActions.resetToSavedTeam}
                getRemainingBudget={getRemainingBudget}
                selectedPlayers={selectedPlayers}
                getTransfersRemaining={getTransfersRemaining}
                calculateTotalPoints={() => calculateTotalPoints(userTeam)}
                checkDeadline={checkDeadline}
            />

            <SidePanel
                isSidePanelOpen={isSidePanelOpen}
                userTeam={userTeam}
                authCountryCode={authCountryCode}
                authPhone={authPhone}
                setShowProfileModal={setShowProfileModal}
                router={router}
                competitionId={competitionId}
                handleLogout={handleLogout}
            />

            {(isSidePanelOpen || showProfileModal) && (
                <div
                    className="overlay show"
                    onClick={() => {
                        if (!showProfileModal) {
                            setIsSidePanelOpen(false);
                        }
                    }}
                />
            )}

            <main className="pitch-area">
                {swapMode && swapSourcePlayer && currentData && (
                    <SwapModeBanner
                        swapSourcePlayer={swapSourcePlayer}
                        onCancel={cancelSwap}
                    />
                )}

                {currentMatchweek === rules?.matchweek && currentData && !isLineupLocked && (
                    <FloatingControls
                        currentData={currentData}
                        tripleRemaining={chipStats.tripleRemaining}
                        benchBoostRemaining={chipStats.benchBoostRemaining}
                        wildcardRemaining={chipStats.wildcardRemaining}
                        toggleTripleCaptain={chipManagement.toggleTripleCaptain}
                        toggleBenchBoost={chipManagement.toggleBenchBoost}
                        toggleWildcard={chipManagement.toggleWildcard}
                    />
                )}

                {isLoading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <h2>Loading...</h2>
                    </div>
                ) : !currentData ? (
                    <div className="empty-state">
                        <h2>Team not ready...</h2>
                    </div>
                ) : (
                    <>
                        <Pitch
                            pitch={pitch}
                            formation={currentData?.picks.formation || '442'}
                            gk={currentData?.picks.gk || []}
                            df={currentData?.picks.df || []}
                            mf={currentData?.picks.mf || []}
                            st={currentData?.picks.st || []}
                            teams={teams}
                            onPlayerClick={handlePlayerSelect}
                            onCaptainClick={captainManagement.toggleCaptain}
                            onViceCaptainClick={captainManagement.toggleViceCaptain}
                            onSwap={handleSwapPlayer}
                            onViewProfile={handleViewProfile}
                            isEditable={currentMatchweek === rules?.matchweek && !isLineupLocked}
                            swapMode={swapMode}
                            swapSourcePlayer={swapSourcePlayer}
                            triple={currentData?.record.triple}
                            allPlayers={currentData?.picks}
                        />

                        {(currentData?.picks.subgk.length > 0 || currentData?.picks.sub.length > 0) && (
                            <div className="bench">
                                <h3 className="bench-title">Substitutes</h3>
                                <div className="bench-players">
                                    {[...currentData.picks.subgk, ...currentData.picks.sub].map((player) => (
                                        <PlayerCard
                                            key={player.id}
                                            player={player}
                                            onRemove={(p) => handlePlayerSelect(p)}
                                            teamName={getTeamName(teams, player.team_id)}
                                            onViewProfile={handleViewProfile}
                                            showSwapButton={currentMatchweek === rules?.matchweek && !isLineupLocked}
                                            onSwap={handleSwapPlayer}
                                            triple={currentData?.record.triple}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {currentMatchweek < (rules?.matchweek || 1) && (
                    <div className="matchweek-status-badge past">
                        📜 Past Matchweek - Read Only
                    </div>
                )}

                {currentMatchweek === rules?.matchweek && !isLineupLocked && currentData && (
                    <button className="fab" onClick={() => setShowPlayerList(!showPlayerList)}>
                        {showPlayerList ? '✕' : '+'}
                    </button>
                )}

                {showPlayerList && currentMatchweek === rules?.matchweek && (
                    <PlayerPanel
                        teams={teams}
                        selectedPosition={selectedPosition}
                        setSelectedPosition={setSelectedPosition}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        selectedTeam={selectedTeam}
                        setSelectedTeam={setSelectedTeam}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filteredPlayers={filteredPlayers}
                        isPlayerSelected={isPlayerSelected}
                        getTeamName={(teamId) => getTeamName(teams, teamId)}
                        handleViewProfile={handleViewProfile}
                        handlePlayerSelect={handlePlayerSelect}
                        currentData={currentData}
                        onClose={() => setShowPlayerList(false)}
                    />
                )}
            </main>
        </div>
    );
}