import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import MovieSchema from '../movies/movieModel';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true},
    password: {type: String, required: true },
    favourites: [{type: MovieSchema}],
    mustwatch: [{type: MovieSchema}]
});

UserSchema.statics.findByUserName = function (username) {
    return this.findOne({ username: username });
};

UserSchema.methods.comparePassword = function (passw, callback) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
      if (err) {
        return callback(err);
      }
      callback(null, isMatch);
    });
};

export default mongoose.model('User', UserSchema);