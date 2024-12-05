import {
  getRecentGroups,
  saveRecentGroup,
  deleteRecentGroup,
  getStarredGroups,
  starGroup,
  unstarGroup,
  getArchivedGroups,
  archiveGroup,
  unarchiveGroup,
} from '@/app/groups/recent-groups-helpers';

describe('Recent Groups Helpers', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: jest.fn((key) => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value;
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getRecentGroups', () => {
    it('returns an empty array when no groups are in storage', () => {
      const groups = getRecentGroups();
      expect(groups).toEqual([]);
    });

    it('returns parsed groups from localStorage', () => {
      const mockGroups = [{ id: '1', name: 'Group 1' }];
      localStorageMock.setItem('recentGroups', JSON.stringify(mockGroups));
      const groups = getRecentGroups();
      expect(groups).toEqual(mockGroups);
    });

    it('returns an empty array for invalid data', () => {
      localStorageMock.setItem('recentGroups', 'invalid-data');
      const groups = getRecentGroups();
      expect(groups).toEqual([]);
    });
  });

  describe('saveRecentGroup', () => {
    it('saves a group to localStorage', () => {
      const group = { id: '1', name: 'Group 1' };
      saveRecentGroup(group);
      const stored = JSON.parse(localStorageMock.getItem('recentGroups')!);
      expect(stored).toEqual([group]);
    });

    it('moves an existing group to the top of the list', () => {
      const group1 = { id: '1', name: 'Group 1' };
      const group2 = { id: '2', name: 'Group 2' };
      localStorageMock.setItem('recentGroups', JSON.stringify([group1, group2]));
      saveRecentGroup(group2);
      const stored = JSON.parse(localStorageMock.getItem('recentGroups')!);
      expect(stored).toEqual([group2, group1]);
    });
  });

  describe('deleteRecentGroup', () => {
    it('removes a group from localStorage', () => {
      const group1 = { id: '1', name: 'Group 1' };
      const group2 = { id: '2', name: 'Group 2' };
      localStorageMock.setItem('recentGroups', JSON.stringify([group1, group2]));
      deleteRecentGroup(group1);
      const stored = JSON.parse(localStorageMock.getItem('recentGroups')!);
      expect(stored).toEqual([group2]);
    });
  });

  describe('getStarredGroups', () => {
    it('returns an empty array when no starred groups are in storage', () => {
      const groups = getStarredGroups();
      expect(groups).toEqual([]);
    });

    it('returns parsed starred groups from localStorage', () => {
      const mockGroups = ['1', '2'];
      localStorageMock.setItem('starredGroups', JSON.stringify(mockGroups));
      const groups = getStarredGroups();
      expect(groups).toEqual(mockGroups);
    });

    it('returns an empty array for invalid data', () => {
      localStorageMock.setItem('starredGroups', 'invalid-data');
      const groups = getStarredGroups();
      expect(groups).toEqual([]);
    });
  });

  describe('starGroup', () => {
    it('adds a group ID to the starred groups', () => {
      starGroup('1');
      const stored = JSON.parse(localStorageMock.getItem('starredGroups')!);
      expect(stored).toEqual(['1']);
    });

    it('does not duplicate group IDs', () => {
      localStorageMock.setItem('starredGroups', JSON.stringify(['1']));
      starGroup('1');
      const stored = JSON.parse(localStorageMock.getItem('starredGroups')!);
      expect(stored).toEqual(['1']);
    });
  });

  describe('unstarGroup', () => {
    it('removes a group ID from the starred groups', () => {
      localStorageMock.setItem('starredGroups', JSON.stringify(['1', '2']));
      unstarGroup('1');
      const stored = JSON.parse(localStorageMock.getItem('starredGroups')!);
      expect(stored).toEqual(['2']);
    });
  });

  describe('getArchivedGroups', () => {
    it('returns an empty array when no archived groups are in storage', () => {
      const groups = getArchivedGroups();
      expect(groups).toEqual([]);
    });

    it('returns parsed archived groups from localStorage', () => {
      const mockGroups = ['1', '2'];
      localStorageMock.setItem('archivedGroups', JSON.stringify(mockGroups));
      const groups = getArchivedGroups();
      expect(groups).toEqual(mockGroups);
    });

    it('returns an empty array for invalid data', () => {
      localStorageMock.setItem('archivedGroups', 'invalid-data');
      const groups = getArchivedGroups();
      expect(groups).toEqual([]);
    });
  });

  describe('archiveGroup', () => {
    it('adds a group ID to the archived groups', () => {
      archiveGroup('1');
      const stored = JSON.parse(localStorageMock.getItem('archivedGroups')!);
      expect(stored).toEqual(['1']);
    });

    it('does not duplicate group IDs', () => {
      localStorageMock.setItem('archivedGroups', JSON.stringify(['1']));
      archiveGroup('1');
      const stored = JSON.parse(localStorageMock.getItem('archivedGroups')!);
      expect(stored).toEqual(['1']);
    });
  });

  describe('unarchiveGroup', () => {
    it('removes a group ID from the archived groups', () => {
      localStorageMock.setItem('archivedGroups', JSON.stringify(['1', '2']));
      unarchiveGroup('1');
      const stored = JSON.parse(localStorageMock.getItem('archivedGroups')!);
      expect(stored).toEqual(['2']);
    });
  });
});
