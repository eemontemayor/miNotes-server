'use strict';

const express = require('express');
const NoteService = require('./note-service');
const NoteRouter= express.Router();
const bodyParser = express.json();
const logger = require('../logger')

const serializeNote = note => ({
  note_id: note.note_id,
  note_name: note.note_name,
  folderid: note.folderid,
  content: note.content
});


NoteRouter
  .route('/api/notes')
  .get((req, res, next) => {
    
    NoteService.getAllNotes(req.app.get('db'))
      .then(notes => {
        return res.json(notes.map(serializeNote));
      })
      .catch(next);
  
  })
  .post(bodyParser, (req, res, next) => {
    const {note_id, note_name, folderid, content}= req.body;
    const newNote = {note_id, note_name, folderid, content};
    NoteService.insertNote( req.app.get('db'), newNote)
      .then(note => {
        return res.json(serializeNote(note));
      })
      .catch(next);
  })


  NoteRouter  
  .route('/api/note/:note_id')
  .all((req,res,next)=>{
   
    NoteService.getById(
      req.app.get('db'),
      req.params.note_id
      )
      .then(note =>{
        
        if (!note) {
          return res.status(404).json({
            error: { message: 'Note doesn\'t exist' }
          });
        }
        res.note = note; //save note for next middleware
        next();
      })
      .catch(next);
  })
  .get((req,res) => {
    return res.json(serializeNote(res.note));
  })

  .delete((req, res, next) => {
      const note_id = req.params.note_id
      NoteService.deleteNote(
        req.app.get('db'),
         note_id
         )
      .then(numRowsAffected => {
        logger.info(`Note with id ${note_id} deleted.`)
        res.status(204).end()
      })
      .catch(next)

  })


  .patch(bodyParser, (req, res, next) => {
    const { note_name, content } = req.body;
    const noteToUpdate = { note_name, content };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: 'request body must contain either \'name\', \'content\', or \'folderid\''
        }
      });
    }

    NoteService.updateNote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = NoteRouter;