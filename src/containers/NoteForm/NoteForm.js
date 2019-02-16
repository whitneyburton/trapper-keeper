import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import shortid from 'shortid';
import CompleteItem from '../../components/CompleteItem/CompleteItem';
import IncompleteItem from '../../components/IncompleteItem/IncompleteItem';
import { putNote } from '../../thunks/putNote';
import { postNote } from '../../thunks/postNote';
import { deleteNoteThunk } from '../../thunks/deleteNoteThunk';

export class NoteForm extends Component {
  constructor() {
    super();
    this.state = {
      title: '',
      listItems: [],
      status: 0,
      focusedListItemID: null
    }
  }

  componentDidMount() {
    const { path } = this.props.match;
    const { title, listItems } = this.props;
    if (path !== '/new-note') {
      this.setState({ title, listItems });
    }
  }

  createListItem = (id, description) => ({
    id,
    description,
    isComplete: false
  })

  editListItems = (listItems, id, description) => {
    return listItems.map(item => {
      return item.id === id ? { ...item, description } : item;
    });
  }

  getListItems = () => {
    const { focusedListItemID, listItems } = this.state;
    const incompleteItems = listItems.filter(item => !item.isComplete);
    const completeItems = listItems.filter(item => item.isComplete);
    return [
      ...incompleteItems.map(item => {
        return (
          <IncompleteItem
            key={item.id}
            id={item.id}
            description={item.description}
            focusedListItemID={focusedListItemID}
            handleComplete={this.handleComplete}
            handleChange={this.handleChange}
            handleItemDelete={this.handleItemDelete}
          />
        );
      }),
      ...completeItems.map(item => {
        return (
          <CompleteItem
            key={item.id}
            id={item.id}
            description={item.description}
            handleComplete={this.handleComplete}
            handleItemDelete={this.handleItemDelete}
          />
        );
      })
    ];
  }

  getNewListItemInput = () => (
    <input
      name={shortid.generate()}
      value=''
      onChange={this.handleChange}
      placeholder='Add new item'
      className='NoteForm--new-input'
    />
  )

  getTitleInput = () => (
    <input
      name='title'
      value={this.state.title}
      placeholder='Title'
      onChange={(event) => this.setState({ title: event.target.value })}
      className='NoteForm--title'
    />
  )

  handleChange = (event) => {
    const { name: id, value: description } = event.target;
    const { listItems } = this.state;
    const existingListItem = listItems.find(item => item.id === id);
    let updatedListItems;
    if (existingListItem) {
      updatedListItems = this.editListItems(listItems, id, description);
    } else {
      updatedListItems = [...listItems, this.createListItem(id, description)];
    }
    this.setState({ listItems: updatedListItems, focusedListItemID: id });
  }

  handleComplete = (id) => {
    const { listItems } = this.state;
    const updatedListItems = listItems.map(item => {
      const { isComplete } = item;
      return item.id === id ? { ...item, isComplete: !isComplete } : item;
    });
    this.setState({ listItems: updatedListItems });
  }

  handleItemDelete = (id) => {
    const { listItems } = this.state;
    const updatedListItems = listItems.filter(item => item.id !== id);
    this.setState({ listItems: updatedListItems });
  }

  handleNoteDelete = async () => {
    const { id } = this.props.match.params;
    const status = await this.props.deleteNoteThunk(id);
    this.setState({ status });
  }

  handleSubmit = async () => {
    const { id } = this.props.match.params;
    const { title, listItems } = this.state;
    let status = 0;
    if (id) {
      status = await this.props.putNote({ id, title, listItems });
    } else {
      status = await this.props.postNote({ title, listItems });
    }
    this.setState({ status });
  }

  render() {
    const { status } = this.state; 
    const { path } = this.props.match;
    return (
      <div className='NoteForm'>
        {this.getTitleInput()}
        {this.getListItems()}
        {this.getNewListItemInput()}
        <button className='NoteForm--submit' onClick={this.handleSubmit}>
          Save
        </button>
        {path !== '/new-note' && 
          <button className='NoteForm--delete' onClick={this.handleNoteDelete}>
            Delete
          </button>}
        {(status >= 200 && status < 300) && <Redirect to='/' />}
      </div>
    )
  }
}

export const mapDispatchToProps = (dispatch) => ({
  putNote: (note) => dispatch(putNote(note)),
  postNote: (note) => dispatch(postNote(note)),
  deleteNoteThunk: (id) => dispatch(deleteNoteThunk(id)),
});

export default connect(null, mapDispatchToProps)(NoteForm);

NoteForm.propTypes = {
  deleteNoteThunk: PropTypes.func,
  putNote: PropTypes.func,
  postNote: PropTypes.func
}