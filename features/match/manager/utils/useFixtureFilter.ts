// import { useState, useRef, useEffect } from 'react';
// import { useAllCompetitionsOptions } from '@/src/competition/utils/competition.api';
// import { useGetTeamsOptions } from '@/src/team/utils/team.api';
// import { useMatchFilter } from '../../utils/useMatchFilter';

// export const useFixtureFilter = () => {
//     const {
//         fixtureParams,
//         setFixtureParam,
//         resetFixtureParams,
//         hasActiveParams,
//         activeParams,
//         queryString,
//         clearParam
//     } = useMatchFilter();

//     const [isOpen, setIsOpen] = useState(false);
//     const [teamSearch, setTeamSearch] = useState('');
//     const [competitionSearch, setCompetitionSearch] = useState('');
//     const containerRef = useRef<HTMLDivElement>(null);

//     const [selectedCompetitionLabel, setSelectedCompetitionLabel] = useState('');
//     const [selectedTeamLabel, setSelectedTeamLabel] = useState('');

//     const competitionOptions = useAllCompetitionsOptions(competitionSearch);
//     const teamOptions = useGetTeamsOptions(teamSearch);

//     // Sync selected labels with URL params
//     useEffect(() => {
//         if (fixtureParams.competitionId) {
//             const option = competitionOptions.find(o => Number(o.value) === fixtureParams.competitionId);
//             if (option) {
//                 setSelectedCompetitionLabel(option.label);
//             }
//         } else {
//             setSelectedCompetitionLabel('');
//         }
//     }, [fixtureParams.competitionId, competitionOptions]);

//     useEffect(() => {
//         if (fixtureParams.teamId) {
//             const option = teamOptions.find(o => Number(o.value) === fixtureParams.teamId);
//             if (option) {
//                 setSelectedTeamLabel(option.label);
//             }
//         } else {
//             setSelectedTeamLabel('');
//         }
//     }, [fixtureParams.teamId, teamOptions]);

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
//                 setIsOpen(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, []);

//     const parseDateValue = (dateStr?: string) => {
//         return dateStr ? new Date(dateStr) : undefined;
//     };

//     const formatDateValue = (date: Date | null) => {
//         if (!date) return '';
//         const offset = date.getTimezoneOffset();
//         const localDate = new Date(date.getTime() - offset * 60 * 1000);
//         return localDate.toISOString().split('T')[0];
//     };

//     const activeFilterCount = Object.values(activeParams).filter(v => v && v.toString().trim()).length;

//     const handleReset = () => {
//         resetFixtureParams();
//         setTeamSearch('');
//         setCompetitionSearch('');
//         setSelectedCompetitionLabel('');
//         setSelectedTeamLabel('');
//         setIsOpen(false);
//     };

//     const handleSelectCompetition = (option: { value: string; label: string }) => {
//         setFixtureParam();
//         setSelectedCompetitionLabel(option.label);
//         setCompetitionSearch('');
//     };

//     const handleClearCompetition = () => {
//         clearParam('competitionId');
//         setSelectedCompetitionLabel('');
//         setCompetitionSearch('');
//     };

//     const handleSelectTeam = (option: { value: string; label: string }) => {
//         setFixtureParam('teamId', Number(option.value));
//         setSelectedTeamLabel(option.label);
//         setTeamSearch('');
//     };

//     const handleClearTeam = () => {
//         clearParam('teamId');
//         clearParam('opponentId');
//         setSelectedTeamLabel('');
//         setTeamSearch('');
//     };

//     // Live-clear: fires on every keystroke via CustomSearch's onQueryChange,
//     // so backspacing to empty clears the URL param immediately — no button needed.
//     const handleCompetitionSearchChange = (query: string) => {
//         setCompetitionSearch(query);
//         if (query === '' && fixtureParams.competitionId) {
//             handleClearCompetition();
//         }
//     };

//     const handleTeamSearchChange = (query: string) => {
//         setTeamSearch(query);
//         if (query === '' && fixtureParams.teamId) {
//             handleClearTeam();
//         }
//     };

//     const getFilterLabel = (key: string, value: any) => {
//         const strValue = value?.toString() || '';
//         if (key === 'competitionId') return selectedCompetitionLabel || strValue;
//         if (key === 'teamId') return selectedTeamLabel || strValue;
//         if (key === 'dateFrom') return `From: ${new Date(strValue).toLocaleDateString()}`;
//         if (key === 'dateTo') return `To: ${new Date(strValue).toLocaleDateString()}`;
//         return strValue;
//     };

//     const getFilterColor = (key: string) => {
//         switch (key) {
//             case 'competitionId': return 'bg-blue-50 text-blue-700';
//             case 'teamId': return 'bg-purple-50 text-purple-700';
//             case 'dateFrom': return 'bg-green-50 text-green-700';
//             case 'dateTo': return 'bg-emerald-50 text-emerald-700';
//             default: return 'bg-gray-50 text-gray-700';
//         }
//     };

//     return {
//         isOpen,
//         setIsOpen,
//         teamSearch,
//         setTeamSearch,
//         competitionSearch,
//         setCompetitionSearch,
//         containerRef,

//         competitionOptions,
//         teamOptions,

//         fixtureParams,
//         setFixtureParam,
//         resetFixtureParams,
//         hasActiveParams,
//         activeParams,
//         queryString,

//         activeFilterCount,
//         selectedCompetitionLabel,
//         selectedTeamLabel,

//         parseDateValue,
//         formatDateValue,
//         handleReset,
//         getFilterLabel,
//         getFilterColor,

//         handleSelectCompetition,
//         handleClearCompetition,
//         handleSelectTeam,
//         handleClearTeam,
//         handleCompetitionSearchChange,
//         handleTeamSearchChange,
//         clearParam,
//     };
// };