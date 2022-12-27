import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MovieDetailsSchema = new Schema({
  adult: { type: Boolean },
  backdrop_path: { type: String },
  belongs_to_collection: { 
    id: { type: Number },
    name: { type: String },
    poster_path: { type: String },
    backdrop_path: { type: String }
  },
  budget: { type: Number },
  genres: [{ 
    id: { type: Number }, 
    name: { type: String }
  }],
  homepage: { type: String },
  id: { type: Number, required: true, unique: true },
  imdb_id: { type: String },
  original_language: { type: String },
  original_title: { type: String },
  overview: { type: String },
  popularity: { type: Number },
  poster_path: { type: String },
  images: {
    backdrops: [{
       aspect_ratio: { type: Number },
       height: { type: Number },
       iso_639_1: { type: String },
       file_path: { type: String },
       vote_average: { type: Number },
       vote_count: { type: Number },
       width: { type: Number }
    }]
  },
  production_companies: [{
    id: { type: Number },
    logo_path: { type: String },
    name: { type: String },
    origin_country: { type: String }
  }],
  production_countries: [{
    iso_3166_1: { type: String },
    name: { type: String }
  }],
  release_date: { type: String },
  revenue: { type: Number },
  runtime: { type: Number },
  spoken_languages: [{
    english_name: { type: String },
    iso_639_1: { type: String },
    name: { type: String }
  }],
  status: { type: String },
  tagline: { type: String },
  original_title: { type: String },
  title: { type: String },
  genre_ids: [{ type: Number }],
  original_language: { type: String },
  title: { type: String },
  video: { type: Boolean },
  vote_average: { type: Number },
  vote_count: { type: Number },
  reviews: [{
    author: { type: String },
    author_details: {
      name: { type: String },
      username: { type: String },
      avatar_path: { type: String },
      rating: { type: Number }
    },
    content: { type: String },
    created_at: { type: Date },
    id: { type: String },
    updated_at: { type: Date },
    url: { type: String }
  }]
});

MovieDetailsSchema.statics.findByMovieDBId = function (id) {
  return this.findOne({ id: id });
};

export default mongoose.model('MovieDetail', MovieDetailsSchema);