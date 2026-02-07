import mongoose from "mongoose"
export const connectDb = async()=>{
    const conn = await mongoose.connect(process.env.MONGO_URI)
    try {
        console.log(`Database connected ${conn.connection.port}`)
    } catch (error) {
        console.log(`Error: ${error.message}`)
        process.exit(1)
    
    }
}