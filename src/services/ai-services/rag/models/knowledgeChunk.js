const mongoose=require('mongoose')
const ragDB = require('../../db/db');

const knowledgeChunkSchema=new mongoose.Schema({
    source:{
        type:String,
        required:true
    },
    chunkIndex:{
        type:Number,
        required:true
    },
    text:{
        type:String,
        required:true
    },
    embedding:{
        type:[Number],
        required:true
    },
    // metadata:{
    //     title:String,
    //     tags:[String]
    // }
},{timestamps:true});

knowledgeChunkSchema.index({source:1,chunkIndex:1},{unique:true});

const getKnowledgeChunkModel=()=>{
    const connection=ragDB.RagDBConnection;

    if(!connection){
        throw new Error('RAG database connection has not been initialized yet.');
    }

    return connection.models.KnowledgeChunk || connection.model("KnowledgeChunk",knowledgeChunkSchema);
};

module.exports=getKnowledgeChunkModel;