import mongoose from "mongoose";

const { Schema } = mongoose;

// ── Diary Entry ─────────────────────────────────────────────
const DiaryEntrySchema = new Schema(
  {
      diaryId: {
        type: Schema.Types.ObjectId,
        ref: "Diary",
        required: true,
        index: true
      },
      Date: {type: Date, required:true, index:true},
      Day: {type: String},
      content:{type: Schema.Types.Mixed},
      favorite: {type: Boolean}, 
      stickers: [{
      id: String,
      x: Number,
      y:Number,
    }], 
    drawing: [{
    strokeType: { type: String, enum: ["brush", "pen"] },
    strokeSize: { type: String, enum: ["big", "small"] },
    strokeColor: { type: String, enum: ["lilac", "blue"] },
    points: [{ x: Number, y: Number }] 
  }],
    fillColor: {type: String},
  },
  { timestamps: true }
);

const DiarySchema = new Schema (
  {
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true, index: true},
    diaryTitle : {
      text: String, 
      defaultStyle:{
        fontFamily: {type: String, default: "Game Paused DEMO" }, 
        fontSize: {type: Number, default: 32},
        color: {type: String, default: "#003E8F" },
      },
      letters: [
      {
        letter: String, 
        style:{
        fontFamily: {type: String, default: "Game Paused DEMO" }, 
        fontSize: {type: Number, default: 32},
        alignment:{ type: String, default: "center" },
        color: {type: String, default: "#003E8F" },

        },
        position:{x:Number, y:Number}
      }
    ]
    }, //so i can access every letter separte
    theme: {type: String, enum: ["lilac", "blue"], default:"lilac"}, // either lilac or blue
    stickers: [{
      id: String,
      x: Number,
      y:Number,
    }], 
  //   settings: {
  //   totalDays: Number, //keep track of all entrys in a month? 
  //   missed: Number, //total days so far in the month - the written days? 
  //   favorite: Number //count the true favorite in the diary schema
  // }
  },


)

// DiarySchema.methods.getFavoriteDates = function () {
//   const favs = [];

//   for (const entry of this.diaryEntrys) {
//     if (entry.favorite === true) {
//       favs.push(entry.Date);
//     }
//   }

//   return favs;
// };

export default mongoose.model("Diary", DiarySchema);
export const DiaryEntry = mongoose.model("DiaryEntry", DiaryEntrySchema);