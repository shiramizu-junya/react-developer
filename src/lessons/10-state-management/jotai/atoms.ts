import { atom } from 'jotai';

export const countAtom = atom(0);

export const firstNameAtom = atom('Taro');
export const lastNameAtom = atom('Yamada');

// firstName と lastName を結合して fullName を作る
export const fullNameAtom = atom((get) => {
	const first = get(firstNameAtom);
	const last = get(lastNameAtom);
	return `${first} ${last}`;
});

export const incrementCountAtom = atom(null, (get, set) => {
	set(countAtom, get(countAtom) + 1);
	console.log('incrementCountAtom');
});

type Todo = { id: number, title: string };

export const todoIdAtom = atom(1);
export const todoAtom = atom(async (get) => {
    const id = get(todoIdAtom);
    const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
    const data: Todo = await response.json();
    return data;
});
