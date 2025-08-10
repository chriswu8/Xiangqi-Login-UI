export const initialAuthState = { mode: 'login', username: '', email: '', password: '' };
export function authReducer(state, action) {
  switch (action.type) {
    case 'SET_MODE': return { ...state, mode: action.mode, email: action.mode === 'login' ? '' : state.email };
    case 'SET_FIELD': return { ...state, [action.name]: action.value };
    case 'RESET': return initialAuthState;
    default: return state;
  }
}
