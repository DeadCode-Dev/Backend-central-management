import mongoose, { Schema, model } from "mongoose";

let userSchema = new Schema({
    name: String,
    Number: Number,
    plan: String,
    ID: String,
    date: String,
    pay: String,
    dateOfPaid: String,
    paid: mongoose.Schema.Types.Mixed,
    comment: String,
    seller: String,
    address: String,
    updates: String
})

const User = model('User', userSchema);

export default User;
