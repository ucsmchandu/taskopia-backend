

const chunkText=(text,options={})=>{
    if(typeof text!=="string" || text.trim()===""){
        throw new Error("text must be non empty string.");
    }
    
    let chunkArray=[];
    let start=0,chunkIndex=0;

    // suse defalut chunk size and overlap if none are provided
    const {chunkSize=800,overlap=150}=options;

    if(overlap>=chunkSize){
        throw new Error("unable to chunk!. overlap must be smaller than chunksize");
    }
    while(start<text.length){
        const end=start+chunkSize;
        const chunk=text.slice(start,end);
        // save the chunk here
        chunkArray.push({
            chunkIndex,
            text:chunk
        });
        chunkIndex++;

        start=end-overlap;
    }

    return chunkArray;
}


module.exports=chunkText;