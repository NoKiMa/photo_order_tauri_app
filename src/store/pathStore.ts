import { atom } from 'jotai'
export const pathAtom = atom<string | null>(null)

export const pathErrorAtom = atom<string | null>(null)