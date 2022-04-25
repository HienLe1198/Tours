const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router();

//Create a checkBody middleWare
// Check if body contain name and price prop
// If not send back 400 (bad request)
// Add it to post handler stack
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTour);

router
  .route('/top-stats')
  .get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTour)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;