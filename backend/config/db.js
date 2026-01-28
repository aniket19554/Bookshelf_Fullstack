import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://aniketsaini1857_db_user:AniketSaini1234@cluster0.qr2oxyx.mongodb.net/BookSeller')
    .then(() => console.log('DB CONNECTED'))
}