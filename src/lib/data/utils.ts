import { teams, events, sites, boardMembers } from "./index";
import type { Site } from "./types";
export * from './utils';

export const getTeamsByCategory = (category: 'ar-ge' | 'sosyal') => {
  return teams.filter(team => team.category === category);
};

export const getTeamBySlug = (slug: string) => {
  return teams.find(team => team.slug === slug);
};

export const getAllEvents = () => events;

export const getFeaturedSites = () => {
  return sites.filter(site => site.featured);
};

export const getSitesByCategory = (category: Site['category']) => {
  return sites.filter(site => site.category === category);
};

export const getManagementBoard = () => boardMembers.management;
export const getSupervisionBoard = () => boardMembers.supervision;

export const getAllBoardMembers = () => [
  ...boardMembers.management,
  ...boardMembers.supervision,
];

export const getBoardMemberById = (id: string) => {
  return getAllBoardMembers().find(member => member.id === id);
};