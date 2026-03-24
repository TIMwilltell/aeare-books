import { writable, derived, get } from 'svelte/store';

export type SyncStatus = 'synced' | 'pending' | 'error' | 'syncing';

export const isOnline = writable(true);

export const syncStatus = writable<SyncStatus>('synced');

export const lastSyncTime = writable<Date | null>(null);

export const hasUnsyncedChanges = derived(
	syncStatus,
	($syncStatus) => $syncStatus === 'pending' || $syncStatus === 'syncing'
);

export function triggerSync() {
	const online = get(isOnline);
	if (!online) {
		console.log('Cannot sync while offline');
		return;
	}
	syncStatus.set('syncing');
	setTimeout(() => {
		syncStatus.set('synced');
		lastSyncTime.set(new Date());
	}, 1000);
}

if (typeof window !== 'undefined') {
	isOnline.set(navigator.onLine);

	window.addEventListener('online', () => {
		isOnline.set(true);
		triggerSync();
	});

	window.addEventListener('offline', () => {
		isOnline.set(false);
	});
}
