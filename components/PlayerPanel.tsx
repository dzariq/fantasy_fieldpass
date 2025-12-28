import PlayerCardChoose from './PlayerCardChoose';

interface PlayerPanelProps {
    teams: any[];
    selectedPosition: string;
    setSelectedPosition: (position: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    selectedTeam: string;
    setSelectedTeam: (team: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filteredPlayers: any[];
    isPlayerSelected: (player: any) => boolean;
    getTeamName: (teamId: number) => string;
    handleViewProfile: (player: any) => void;
    handlePlayerSelect: (player: any) => void;
    currentData: any;
    onClose: () => void;
}

export default function PlayerPanel({
    teams,
    selectedPosition,
    setSelectedPosition,
    sortBy,
    setSortBy,
    selectedTeam,
    setSelectedTeam,
    searchQuery,
    setSearchQuery,
    filteredPlayers,
    isPlayerSelected,
    getTeamName,
    handleViewProfile,
    handlePlayerSelect,
    currentData,
    onClose
}: PlayerPanelProps) {
    return (
        <div className="player-panel">
            <div className="panel-header">
                <h2>Select Players</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="filters">
                <div className="position-filters">
                    {['ALL', 'GK', 'DF', 'MF', 'ST'].map(pos => (
                        <button
                            key={pos}
                            className={`filter-btn ${selectedPosition === pos ? 'active' : ''}`}
                            onClick={() => setSelectedPosition(pos)}
                        >
                            {pos}
                        </button>
                    ))}
                </div>
                
                <div className="sort-filter-dropdown">
                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="points">Sort by Points</option>
                        <option value="goals">Sort by Goals</option>
                        <option value="assists">Sort by Assists</option>
                        <option value="value">Sort by Value</option>
                    </select>
                </div>

                <div className="team-filter-dropdown">
                    <select
                        className="team-select"
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                    >
                        <option value="ALL">All Teams</option>
                        {teams.map(team => (
                            <option key={team.id} value={team.name}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="player">
                {filteredPlayers.map(player => (
                    <PlayerCardChoose
                        key={player.id}
                        player={player}
                        isSelected={isPlayerSelected(player)}
                        teamName={getTeamName(player.team_id)}
                        onViewProfile={handleViewProfile}
                        onSelect={(p) => handlePlayerSelect(p)}
                        triple={currentData?.record.triple}
                    />
                ))}
            </div>
        </div>
    );
}