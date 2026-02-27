import type { ProgressState } from '../stores/progressStore';
import { sanitizeProgressState } from '../stores/progressStore';

type SyncPayload = {
	v: 1;
	progress: ProgressState;
};

const encodeBase64Url = (value: string): string => {
	if (typeof globalThis.btoa !== 'function') {
		throw new Error('Base64 encoding is not available in this environment');
	}

	return globalThis
		.btoa(unescape(encodeURIComponent(value)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');
};

const decodeBase64Url = (value: string): string => {
	if (typeof globalThis.atob !== 'function') {
		throw new Error('Base64 decoding is not available in this environment');
	}

	const padded = value.replace(/-/g, '+').replace(/_/g, '/');
	const withPadding = `${padded}${'='.repeat((4 - (padded.length % 4)) % 4)}`;

	return decodeURIComponent(escape(globalThis.atob(withPadding)));
};

export const serializeProgress = (progressState: Partial<ProgressState>): string => {
	const payload: SyncPayload = {
		v: 1,
		progress: sanitizeProgressState(progressState),
	};

	return encodeBase64Url(JSON.stringify(payload));
};

export const deserializeProgress = (encodedProgress: string): ProgressState => {
	const decoded = decodeBase64Url(encodedProgress);
	const parsed = JSON.parse(decoded) as Partial<SyncPayload>;

	if (parsed.v !== 1 || !parsed.progress) {
		throw new Error('Invalid sync payload version');
	}

	return sanitizeProgressState(parsed.progress);
};

export const createSyncLink = (
	origin: string,
	progressState: Partial<ProgressState>,
): string => {
	const url = new URL('/sync', origin);
	url.searchParams.set('data', serializeProgress(progressState));
	return url.toString();
};
