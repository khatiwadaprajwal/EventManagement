import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createEventSchema, updateEventSchema } from '../validators/event.schema';

const router = Router();

// Public Routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEvent);

// Protected Routes (Admin/Organizer only)
router.use(protect); // All routes below this require login

router.post(
  '/', 
  restrictTo('ADMIN'), 
  validate(createEventSchema), 
  eventController.createEvent
);

router.delete(
  '/:id', 
  restrictTo('ADMIN'), 
  eventController.deleteEvent
);

// We can add update later
// router.patch('/:id', restrictTo('ADMIN', 'ORGANIZER'), validate(updateEventSchema), eventController.updateEvent);

export default router;