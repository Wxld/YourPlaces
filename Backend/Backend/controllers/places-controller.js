const {v4 : uuid} = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError("Something went wrong, could not find place", 
        500);

        return next(error);
    }

    if(!place) {
        const error = new HttpError("Places for the current placeId doesn't exist!", 404);

        return next(error);
    }

    res.json({place: place.toObject({ getters: true })});
};


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithPlaces;

    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch(err) {
        const error = new HttpError("Fetching places failed, please try again later.", 
        500);

        return next(error);
    }

    // if(!place) {
    //     return res.status(404).json({message: "Places for the current userId doesn't exist!"});
    // }

    // what we do here is next function is called which will take the control to the next middleware which is the error middleware [in app.js]
    // out of the two ways of throw err and next, the next method is better since it will work in asynchronous mode as well
    if(!userWithPlaces.places.length) {
        return next(new HttpError("Places for the current userId doesn't exist!", 404));
    } 

    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError('Invalid input!', 422);
    }
    const { title, description, address, creator } = req.body;

    // dummy location coordinates
    const location = {
        lat: 34,
        lon: 30
    };

    const createdPlace = new Place({
        title,
        description,
        location,
        address,
        creator,
        image: "https://images.app.goo.gl/Vfu4iJdnJXNLxGQZ8"
    });

    let user;

    try {
        user = await User.findById(creator);
    } catch(err) {
        const error = new HttpError('Creating place failed, please try again later.', 500);
        return next(error);
    }

    if(!user) {
        const error = new HttpError('Could not find the provided id for user.', 404);
        return next(error);
    }

 
    // if any one of the task out of adding createdPlace to the database or adding the place_id into the user's place array fails then we have to rollback completely.
    try { 
        const sess = await mongoose.startSession();
        sess.startTransaction();
        // passing the arguement to make this task the part of the session
        await createdPlace.save({session: sess});
        // mongoose bts only pushes the object_id in user.places array
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch(err) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({place: createdPlace});    
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError('Invalid input!', 422);
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;

    // if we don't de-reference it then we would not get the whole object but only the reference
    // and in that case we would be changing the original data which is bug-prone since if the change fails midway then it will make our database inconsistent
    // const updatedPlace = {...DUMMY_PLACES.find(p => p.id === placeId)};
    // const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);

    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError("Something went wrong, could not update place", 
        500);

        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch(err) {
        const error = new HttpError("Something went wrong, could not update place", 
        500);

        return next(error);
    }

    // DUMMY_PLACES[placeIndex] = updatedPlace;
    
    res.status(200).json({ place: place.toObject({ getters: true }) });
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        // populate function can be used to work with another collection although there needs to be some connection/relation between the two collections
        // we can only use populate function when there's reference set between the two collections
        place = await Place.findById(placeId).populate('creator');
        // since the creator's datatype is the MongoDB objectID and through populate the user having that objectId is now stored in place.creator
        // console.log(place);
    } catch(err) {
        const error = new HttpError("Something went wrong, could not delete place", 
        500);

        return next(error);
    }

    if(!place) {
        const error = new HttpError("Could not find place for this id", 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({session: sess});
        // even though we pass place, only the place's objectID is sent and that is removed from place.creator.places array
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    } catch(err) {
        const error = new HttpError("Something went wrong, could not delete place second", 500);

        return next(error);
    }
    
    res.status(200).json({ message: "Deleted the place!" });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;