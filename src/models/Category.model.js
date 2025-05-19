import mongoose from "mongoose";
import slug from "mongoose-slug-updater";
mongoose.plugin(slug);
const categorySchema = new mongoose.Schema({
	title: String,
	parent_id:String,
	description: {
		type: String,
		default:""
	},
	thumbnails:String,
	status: String,
	position: Number,
	slug: {
        type: String,
        slug: "title",
        unique: true,
      },
	deleted: {
        type: Boolean,
        default: false
    },
	deletedAt: Date,
  },{timestamps: true, versionKey: false});
const Cateogry = mongoose.model("Cateogry", categorySchema,"categories");

export default Cateogry;
