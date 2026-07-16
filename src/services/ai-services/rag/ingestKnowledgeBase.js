require('dotenv').config();
const buildChunksFromKnowledgeBase=require('./utils/buildChunksFromKnowledgeBase')
const getKnowledgeChunkModel=require('./models/knowledgeChunk') //database model
const generateEmbedding=require('./utils/generateEmbedding')

// database
const {connectRagDB}=require('../db/db')

// allowed tasks type
const allowedTaskTypes=new Set(['RETRIEVAL_DOCUMENT','RETRIEVAL_QUERY'])


const ingestKnowledgeBase=async(options={})=>{
    try{
        const {taskType='RETRIEVAL_DOCUMENT'}=options;

        // checking the task types
        if(!allowedTaskTypes.has(taskType)){
            throw new Error(`Invalid embedding taskType: ${taskType}`);
        }

        // connect to rag data base
        await connectRagDB();

        // get the model
        const KnowledgeChunk=getKnowledgeChunkModel();

        // get all chunks
        /**
         * source
         * chunkIndex
         * text
         */
        const chunks=await buildChunksFromKnowledgeBase();

        console.log(`found ${chunks.length} chunks.`);

        // process the every chunk
        for(let i=0;i< chunks.length;i++){
            const chunk=chunks[i];

            console.log(`chunk ${i+1}/${chunks.length} (${chunk.source} - ${chunk.chunkIndex}) [${taskType}]`);

            // generate embedding for every chunk
            const embedding=await generateEmbedding(chunk.text,taskType);

            // store or update the db
            await KnowledgeChunk.updateOne(
                {
                    source:chunk.source,
                    chunkIndex:chunk.chunkIndex
                },
                {
                    $set:{
                        source:chunk.source,
                        chunkIndex:chunk.chunkIndex,
                        text:chunk.text,
                        embedding:embedding
                    }
                },
                {
                    upsert:true
                }
            );

            console.log("embedding saved.");
        }

        console.log("knowledge base ingestion is completed.");
        process.exit(0);

    }catch(err){
        console.log(err)
        process.exit(1);
    }
}
ingestKnowledgeBase();
module.exports=ingestKnowledgeBase;