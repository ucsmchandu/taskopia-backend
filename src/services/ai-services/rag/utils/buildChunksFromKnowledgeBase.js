const readKnowledgeBase=require('./readKnowledgeBase');
const chunkText=require('./chunkText');


const buildChunksFromKnowledgeBase=async()=>{
    const allChunks=[];
    try {
        
        // get the all data fron the knowledge base
        const knowledge=await readKnowledgeBase();

        for(const doc of knowledge){

            // chunk the text into smaller parts
            const chunks=chunkText(doc.content);

            // for(const chunk of chunks){
            //     allChunks.push({
            //         source:doc.source,
            //         chunkIndex:chunk.chunkIndex,
            //         text:chunk.text
            //     })
            // }

            // const chunksWithSource=chunks.map(chunk=>({
            //     source:doc.source,
            //     chunkIndex: chunk.chunkIndex,
            //     text: chunk.text
            // }))

            // allChunks.push(...chunksWithSource)

            allChunks.push(
                ...chunks.map(chunk=>({
                    source: doc.source,
                    chunkIndex: chunk.chunkIndex,
                    text: chunk.text
                }))
            )
        }

        return allChunks;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports=buildChunksFromKnowledgeBase;