export type EmptyObject = Record<string, never>;

export interface User {
  userId: number;
  name: string;
  email: string;
  password: string;
  oldPwords?: string[];
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Quiz {
  quizId: number;
  userId: number;
  name: string;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
}

export interface Token {
  tokenId: string;
  authUserId: number;
}

export interface Data {
  users: User[];
  quizzes: Quiz[];
  tokens: Token[];
  trash: Quiz[];
}

let data: Data = {
  users: [],
  quizzes: [],
  tokens: [],
  trash: []
};

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
export function getData(): Data {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: Data) {
  data = newData;
}
