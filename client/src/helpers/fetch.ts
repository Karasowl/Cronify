 import.meta.env

 export async function fetcherGET({url}:IFetchOptions) {
    try {

      const response = await fetch(url)
      return response.json()

    } catch(err){

      console.log(`Dessde el fetchGET:${err}`)
      return err
      
    }
  }

 export async function fetcherPOST({url, options}:IFetchOptions) {
    try {

      const response = await fetch(url, options)
      console.log(response)
      return response.json()

    } catch(err){

      console.log(`Dessde el fetchPost:${err}`)
      return err
      
    }
  }



  