import { fetchData, createOptions } from '../utils/api';
import { addNote, setError, toggleLoading } from '../actions';

export const postNote = (note) => {
  return async (dispatch) => {
    const { title, listItems } = note;
    const url = 'http://localhost:3001/api/v1/notes/';
    const options = createOptions('POST', { title, listItems });
    try {
      dispatch(toggleLoading(true));
      const response = await fetchData(url, options);
      dispatch(toggleLoading(false));
      const note = await response.json();
      dispatch(addNote(note));
      return response.status;
    } catch (error) {
      dispatch(setError(error.message));
    }
  }
}