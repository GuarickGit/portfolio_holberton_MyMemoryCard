import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
  createReview,
  getReviews,
  getGameReviews,
  getUserReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Routes publiques (pas besoin d'être connecté)
router.get('/', getReviews);                      // GET /reviews (feed global)
router.get('/game/:rawgId', getGameReviews);
router.get('/user/:userId', getUserReviews);

// Routes protégées (nécessitent un token JWT)
router.post('/', verifyToken, createReview);
router.put('/:id', verifyToken, updateReview);
router.delete('/:id', verifyToken, deleteReview);

export default router;
