'use strict';

const express = require('express');
const FolderService = require('./folder-service');
const FolderRouter= express.Router();
const bodyParser = express.json();
const logger = require('../logger')


const serializeFolder = folder => ({
  id: folder.id,
  folder_name: folder.folder_name,
});

FolderRouter
  .route('/api/folders')
  // .all() here will trigger for all methods helpfl for validation 
  .get((req, res, next) => {
    
    FolderService.getAllFolders(req.app.get('db'))
      .then(folders => {
        return res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { id, folder_name } = req.body;
    const newFolder = { id, folder_name };
    FolderService.insertFolder(req.app.get('db'), newFolder)
      .then(folder => {
        return res.json(serializeFolder(folder));
      })
      .catch(next)
    })


    
FolderRouter
  .route('/api/folder/:id')
  .all((req, res, next) => {
    
    FolderService.getById(req.app.get('db'), req.params.id) // knex instance of db will be matched with bookmrk id
      .then(folder => { //  promise-like object
        if (!folder) {
          logger.error(`folder with id ${id} not found.`)
          return res.status(404).json({
            error: { message: `folder Not Found` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)

  })      
.get((req, res) => {
    res.json(serializeFolder(res.folder))
  })
  
.delete((req, res, next) => {
  
  const {id}  = req.params;
  FolderService.deleteFolder(
    req.app.get('db'),
    id
  )
    .then(numRowsAffected => {
      logger.info(`folder with id ${id} deleted.`)
      res.status(204).end()
    })
    .catch(next)
})



.patch(bodyParser, (req, res, next) => {
  const { folder_name} = req.body;
  const folderToUpdate = { folder_name};

  const numberOfValues = Object.values(folderToUpdate).filter(Boolean).length;
  if (numberOfValues === 0) {
    return res.status(400).json({
      error: {
        message: 'request body must contain \'name\''
      }
    });
  }
  FolderService.updateFolder(
    req.app.get('db'),
    req.params.id,
    folderToUpdate
  )
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
});


  

module.exports = FolderRouter;