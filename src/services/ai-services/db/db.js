const mongoose=require('mongoose')

let RagDBConnection;

const connectRagDB=async()=>{
    try{
        const RAG_DBURL=process.env.RAG_DBURL;

        RagDBConnection=mongoose.createConnection(RAG_DBURL);
        await RagDBConnection.asPromise();
        console.log("RAG database is connected.");
    }catch(err){
        console.log(err);
        console.log(err.message);
        process.exit(1);
    }
}

module.exports={
    connectRagDB,
    get RagDBConnection(){
        return RagDBConnection;
    }
};