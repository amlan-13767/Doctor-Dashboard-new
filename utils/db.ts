import mongoose from "mongoose";

let cached = global.mongoose
if(!cached){
    cached = global.mongoose = {conn:null,promise:null}
}

export async function connectToDatabase() {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
        throw new Error("Define MONGODB_URI in .env");
    }

    if(cached.conn){
        return cached.conn
    }
    if(!cached.promise){
       cached.promise = mongoose
        .connect(mongodbUri)
        .then(()=>mongoose.connection)
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise=null
        throw error
    }

    return cached.conn
}