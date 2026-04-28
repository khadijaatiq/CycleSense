// Simple in-memory session — persists for the lifetime of the app
// No AsyncStorage needed, works across all tabs

let _token = '';
let _name  = '';

export const session = {
    setToken: (t: string) => { _token = t; },
    getToken: ()          => _token,
    setName:  (n: string) => { _name = n; },
    getName:  ()          => _name,
    clear:    ()          => { _token = ''; _name = ''; },
};
