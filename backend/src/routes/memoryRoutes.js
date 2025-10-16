import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  createMemory,
  getMemories,
  getGameMemories,
  getUserMemories,
  updateMemory,
  deleteMemory
} from '../controllers/memoryController.js';

const router = express.Router();

// Routes publiques
router.get('/', getMemories);  // feed global
router.get('/game/:rawgId', getGameMemories);
router.get('/user/:userId', getUserMemories);

// Routes protégées (nécessitent un token JWT)
router.post('/', verifyToken, createMemory)  // ajouter souvenir
router.put('/:id', verifyToken, updateMemory);
router.delete('/:id', verifyToken, deleteMemory)

export default router;
