require('dotenv').config();
const generateEmbedding=require('./generateEmbedding');
const getKnowledgeChunkModel=require('../models/knowledgeChunk');
// generateEmbedding(text,RETRIEVAL_QUERY)


const searchRelevantChunks=async(question,limit=5)=>{
    try {
        if(typeof question!=="string" || question.trim()===""){
            throw new Error("question must be non empty string.");
        }

        // generate embedding
        const questionEmbedding=await generateEmbedding(question,"RETRIEVAL_QUERY");

        // get the database
        const KnowledgeChunk= getKnowledgeChunkModel();

        // get the data from db
        const results=await KnowledgeChunk.aggregate([
            {
                $vectorSearch:{
                    index:"vector_index",
                    path:"embedding",
                    queryVector:questionEmbedding,
                    numCandidates:100,
                    limit
                }
            },
            {
                $project:{
                    source:1,
                    chunkIndex:1,
                    text:1,
                    score:{
                        $meta:"vectorSearchScore"
                    }
                }
            }
        ]);

        console.log(results);
        return results;

    } catch (error) {
        console.log(error)
        throw error;
    }
}

// searchRelevantChunks("What is Taskopia and who are Hosts?");

module.exports=searchRelevantChunks;