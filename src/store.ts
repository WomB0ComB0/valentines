import { atom } from 'nanostores';

export const letter = atom<string>('');
export const isLoading = atom<boolean>(false);
