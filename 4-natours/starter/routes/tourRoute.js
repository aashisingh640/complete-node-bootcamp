const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

//using middleware to check params
// router.param('id', tourController.checkId);
// router.route('/').get(tourController.getAllTours).post(tourController.checkBody, tourController.createNewTour);

router.route('/').get(tourController.getAllTours).post(tourController.createNewTour);
router.route('/top-5-routes').get(tourController.topFiveRoutes, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-tours/:year').get(tourController.getMonthlyTours);
router.route('/:id').get(tourController.getTour).patch(tourController.updateTour).delete(tourController.deleteTour);

module.exports = router;