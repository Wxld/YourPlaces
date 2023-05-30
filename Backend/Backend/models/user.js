const mongoose = require('mongoose');
// this checks whether the email inserted during login is unique or not
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true },
    email: {type: String, required: true, unique: true },
    password: {type: String, required: true, minlength: 8 },
    image: {type: String, required: true },
    // wrapping [] means, there are multiple entries, basically an array :)
    places: [{type: mongoose.Types.ObjectId, required: true, ref: 'Place'}]
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);