const Tour = require('./../models/tourModel');
const apiFeatures = require('./../utils/apiFeatures');
const appError = require('./../utils/appError');

function topFiveRoutes(req, res, next) {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    next();
}

async function getAllTours(req, res) {

    try {

        const features = new apiFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();

        // const query = await features;

        const tours = await features.query;
        
        return res.json({
            success: true,
            result: tours.length,
            data: {
                tours
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ 
            success: false,
            message: err.message || err
        })
    }
}

async function getTour(req, res, next) {

    try {
        const id = req.params.id;

        const tour = await Tour.findById(id);

        if (!tour) {
            return next(new appError('no tour found with the given id', 404))
        }
    
        return res.json({ 
            success: true,
            data: {
                tour
            }
        })

    } catch (err) {

        return res.status(404).json({ 
            success: false,
            message: `tour not found with the given id : ${req.params.id}`,
            err: err
        })
    
    }

}

async function createNewTour(req, res) {

    try {

        const newTour = await Tour.create(req.body);

        res.status(201).json({ 
            success: true,
            data: {
                tours: newTour
            }
        })

    } catch (err) {
        return res.status(400).json({ 
            success: false,
            message: err
        })
    }

}

async function updateTour(req, res, next) {

    try {
        
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if (!tour) {
            return next(new appError('no tour found with the given id', 404))
        }
    
        res.status(200).json({ 
            success: true,
            data: {
                tour
            }
        })

    } catch (err) {
        return res.status(500).json({ 
            success: false,
            err: err
        })
    }

}

async function deleteTour(req, res, next) {

    try {

        const tour = await Tour.findByIdAndDelete(req.params.id);

        if (!tour) {
            return next(new appError('no tour found with the given id', 404))
        }

        res.status(204).json({ 
            success: true,
            data: null
        })

    } catch (err) {
        return res.status(500).json({ 
            success: false,
            err: err
        })
    }

}

async function getTourStats(req, res) {

    try {

        const stats = await Tour.aggregate(
            [
                { $match: { ratingsAverage: { $gte : 4.5 } } },
                { $group : {
                        _id: '$difficulty',
                        numTours: { $sum: 1 },
                        numRatings: { $sum: '$ratingsQuantity' },
                        avgRating: { $avg: '$ratingsAverage'},
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' },
                    }
                },
                { $sort: { avgPrice : 1 } }
            ]
        );

        res.json({ 
            success: true,
            data: {
                stats
            }
        })

    } catch (err) {
        return res.status(500).json({ 
            success: false,
            err: err
        })
    }

}

async function getMonthlyTours(req, res) {

    try {

        const year = +req.params.year;

        const monthlyTours = await Tour.aggregate(
            [
                { $unwind: '$startDates' },
                { $match: { startDates: { $gte : new Date(`${year}-01-01`), $lte : new Date(`${year}-12-31`) } } },
                { $group : {
                        _id: { $month : '$startDates' },
                        numTours: { $sum: 1 },
                        tours: { $push: '$name' }
                    }
                },
                { $addFields: { month : '$_id' } },
                { $project: { _id : 0 } },
                { $sort: { numTours : -1 } }
            ]
        );

        res.json({ 
            success: true,
            data: {
                monthlyTours
            }
        })

    } catch (err) {
        return res.status(500).json({ 
            success: false,
            err: err
        })
    }

}

module.exports = { getAllTours, getTour, updateTour, createNewTour, deleteTour, topFiveRoutes, getTourStats, getMonthlyTours };