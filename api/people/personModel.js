import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  adult: { type: Boolean },
  also_known_as: { type: Array },
  biography: { type: String },
  birthday: { type: String },
  deathday: { type: String },
  gender: { type: Number },
  homepage: { type: String },
  id: { type: Number, required: true, unique: true },
  imdb_id: { type: String },
  known_for_department: { type: String },
  name: { type: String },
  place_of_birth: { type: String },
  popularity: { type: Number },
  profile_parth: { type: String}
});

PersonSchema.statics.findByPersonDBId = function (id) {
  return this.findOne({ id: id });
};

export default mongoose.model('Person', PersonSchema);