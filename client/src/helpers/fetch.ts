 import.meta.env

 export async function fetcherGET({url}:IFetchOptions) {
    try {

      const response = await fetch(url)
      return await response

    } catch(err){

      console.log(err)
      return err
      
    }
  }

 export async function fetcherPOST({url, options}:IFetchOptions) {
    try {

      const response = await fetch(url, options)
      return await response.json()

    } catch(err){

      console.log(err)
      return err
      
    }
  }



  