const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: [true, 'Name must be unique'],
        trim: true,
        maxlength: [40, 'Tour name must have less than or equal to 40 characters'],
        minlength: [10, 'Tour name must have greater than or equal to 10 characters'],
        // validate: [validator.isAlpha, 'name should contain only alphabets']
    },
    slug: String,
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            message: 'Discounted price ({VALUE}) should be greater than the actual price',
            validator: function(value) {
                return value < this.price
            }
        }
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a Group Size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values : ['easy', 'medium', 'difficult'],
            message: 'Tour difficulty can be - easy, medium and difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 3.5,
        required: [true, 'A tour must have a ratingsAverage'],
        max: [5, 'Tour rating must be less than or equal to 5'],
        min: [1, 'Tour rating must be greater than or equal to 1'],
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        required: [true, 'A tour must have a summary'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        trim: true
    },
    images: [String],
    startDates: [Date],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    secretTour: {
        type: Boolean,
        default: false
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

//virtual properties, are not actually saved in the database.
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
})

//document middleware, works only before .save() or .create(), can have multiple middlewares for same state
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
})

//document middleware, works only after .save() or .create()
tourSchema.post('save', function (doc, next) {
    console.log('after saving document...', doc)
    next();
})

//query middleware, works for all queries starting with find (find, findOne, findOneAndUpdate etc.)
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour : { $ne: true } });
    next();
})

//aggregate middleware
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour : { $ne: true } } });
    next();
})

const Tour = new mongoose.model('Tour', tourSchema);

module.exports = Tour;