
'use strict';

const NoteService = {
  getAllNotes(knex){
    return knex.select('*').from('notes');
  },
  getById(knex, id) {
    return knex.from('notes').select('*').where('note_id', id).first()
  },
  insertNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into('notes')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteNote(knex, id){
    return knex('notes')
      .where('note_id', id)
      .delete()
  },
  updateNote(knex, id, newNoteFields) {
    return knex('notes')
      .where('note_id', id)
      .update(newNoteFields)
  },

};
module.exports = NoteService;