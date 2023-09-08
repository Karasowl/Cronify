import * as Types from "./../types"

  async function fetcher({url, options}:Types.IFetchOptions):Promise<Response | Error | unknown>  {
    try {

      const response = await fetch(url, options)
      if(!response.ok){
        console.log(`response is not ok`)
        const error = await response.json()
         throw new Error(error.message)
        }
        const data:Types.IResponseData = await response.json()
        return (data as Types.IResponseData).data

    } catch(err){

      console.log(`Error es instancia de Error: ${err instanceof Error}`)
      if(err instanceof Error){
        console.log(err.message)
        return err.message
      }
      
    }
  }

  export default fetcher



  