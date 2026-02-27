import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import {supabase} from "./lib/supabase"
import IdentifyRouter from "./routes/route"

dotenv.config()
const PORT = process.env.PORT ;

const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/v1",IdentifyRouter)

app.get("/",(_req,res)=>{
    res.status(200).json({message : "Server is Running "})
})

app.get("/db-test", async (_req, res) => {
  const { data, error } = await supabase.from("Contact").select("*").limit(1);

  if (error) {
    console.log(error)
    return res.status(500).json({
      message: "Supabase connection failed",
      error: error.message,
    });
  }
  console.log("Supabase Connected and length is", data.length)

  return res.status(200).json({
    message: "Supabase connected ✅",
    sample: data,
  });
});

app.listen(PORT,()=>{
    console.log("server is running on port", PORT )
})
 
