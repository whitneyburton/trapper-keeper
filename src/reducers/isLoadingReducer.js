export const isLoadingReducer = (state = false, action) => {
  switch (action.type) {
    case 'TOGGLE_LOADING':
      return action.bool;
    default:
      return state;
  }
}