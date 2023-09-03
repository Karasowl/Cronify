 import.meta.env

 export async function fetcherGET({url}:IFetchOptions) {
    try {

      const response = await fetch(url)
      return response

    } catch(err){

      console.log(err)
      return err
      
    }
  }

 export async function fetcherPOST({url, options}:IFetchOptions) {
    try {

      const response = await fetch(url, options)
      return response

    } catch(err){

      console.log(err)
      return err
      
    }
  }



  