import { DailyMission } from './missions';

const STORAGE_KEY = 'sharkgame.missions.v1';

export interface MissionDayState {
  mission: DailyMission;
  practicedItemKeys: string[];
  completed: boolean;
  completedAt: number | null;
  ritualDone: boolean;
  minutesPracticed: number;
}

export interface MissionHistoryEntry {
  date: string;
  story: string;
  items: string[];
  sticker: string;
  minutesPracticed: number;
}

export interface MissionStoreState {
  days: Record<string, MissionDayState>;
  history: MissionHistoryEntry[];
  streak: number;
  lastCompletedDate: string | null;
}

const emptyStore = (): MissionStoreState => ({
  days: {},
  history: [],
  streak: 0,
  lastCompletedDate: null,
});

export const loadMissionStore = (): MissionStoreState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as MissionStoreState;
    if (!parsed || typeof parsed !== 'object') return emptyStore();
    return {
      days: parsed.days || {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastCompletedDate: parsed.lastCompletedDate || null,
    };
  } catch {
    return emptyStore();
  }
};

export const saveMissionStore = (store: MissionStoreState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const ensureMissionDay = (
  store: MissionStoreState,
  dateKey: string,
  mission: DailyMission
): MissionStoreState => {
  const existing = store.days[dateKey];
  if (existing) {
    if (
      existing.mission.poolMode !== mission.poolMode &&
      existing.practicedItemKeys.length === 0 &&
      !existing.completed
    ) {
      return {
        ...store,
        days: {
          ...store.days,
          [dateKey]: {
            ...existing,
            mission,
          },
        },
      };
    }
    return store;
  }
  return {
    ...store,
    days: {
      ...store.days,
      [dateKey]: {
        mission,
        practicedItemKeys: [],
        completed: false,
        completedAt: null,
        ritualDone: false,
        minutesPracticed: 0,
      },
    },
  };
};

export const addPracticedMissionItem = (
  store: MissionStoreState,
  dateKey: string,
  itemKey: string,
  minutesDelta: number
): MissionStoreState => {
  const day = store.days[dateKey];
  if (!day) return store;
  const already = day.practicedItemKeys.includes(itemKey);
  const nextKeys = already ? day.practicedItemKeys : [...day.practicedItemKeys, itemKey];
  const nextMinutes = Math.max(0, day.minutesPracticed + minutesDelta);
  return {
    ...store,
    days: {
      ...store.days,
      [dateKey]: {
        ...day,
        practicedItemKeys: nextKeys,
        minutesPracticed: nextMinutes,
      },
    },
  };
};

const previousDateKey = (dateKey: string) => {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const completeMissionRitual = (store: MissionStoreState, dateKey: string): MissionStoreState => {
  const day = store.days[dateKey];
  if (!day || day.completed) return store;

  const nextStreak =
    store.lastCompletedDate === previousDateKey(dateKey)
      ? store.streak + 1
      : store.lastCompletedDate === dateKey
      ? store.streak
      : 1;

  const historyWithoutToday = store.history.filter((h) => h.date !== dateKey);
  const historyEntry: MissionHistoryEntry = {
    date: dateKey,
    story: day.mission.story,
    items: day.practicedItemKeys,
    sticker: day.mission.sticker,
    minutesPracticed: day.minutesPracticed,
  };

  return {
    ...store,
    streak: nextStreak,
    lastCompletedDate: dateKey,
    days: {
      ...store.days,
      [dateKey]: {
        ...day,
        completed: true,
        ritualDone: true,
        completedAt: Date.now(),
      },
    },
    history: [historyEntry, ...historyWithoutToday].slice(0, 60),
  };
};
