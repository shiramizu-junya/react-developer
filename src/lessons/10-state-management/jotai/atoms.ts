import { atom } from 'jotai';

export const countAtom = atom(0);

export const firstNameAtom = atom("Taro");
export const lastNameAtom = atom("Yamada");

// firstName と lastName を結合して fullName を作る
export const fullNameAtom = atom((get) => {
    const first = get(firstNameAtom);
    const last = get(lastNameAtom);
    return `${first} ${last}`;
});
