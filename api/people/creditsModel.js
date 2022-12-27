import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CreditsSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  cast: [{
    adult: { type: Boolean },
    gender: { type: Number },
    known_for_department: { type: String },
    name: { type: String },
    original_name: { type: String },
    popularity: { type: Number },
    profile_parth: { type: String },
    cast_id: { type: Number },
    character: { type: String },
    credit_id: { type: String },
    order: { type: Number }
  }],
  crew: [{
    adult: { type: Boolean },
    gender: { type: Number },
    known_for_department: { type: String },
    name: { type: String },
    original_name: { type: String },
    popularity: { type: Number },
    profile_parth: { type: String },
    credit_id: { type: String },
    department: { type: String },
    job: { type: String }
  }]
});

CreditsSchema.statics.findByMovieDBId = function (id) {
  return this.findOne({ id: id });
};

export default mongoose.model('MovieCredit', CreditsSchema);